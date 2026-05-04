import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { pushRequestMetric } from "@/lib/runtime-metrics";
import { logOrder } from "@/lib/logger";

const orderSchema = z
  .object({
    productId: z.string().min(1, "กรุณาเลือกสินค้า"),
    quantity: z.number().int().positive().max(99).optional(),
  })
  .transform((d) => ({
    productId: d.productId,
    quantity: d.quantity ?? 1,
  }));

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "จำเป็นต้องเข้าสู่ระบบ" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, id: true } },
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "จำเป็นต้องเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = session.user.id;

    const { success } = await rateLimit(`orders_${userId}`, 20, 3_600_000);
    if (!success) {
      pushRequestMetric({
        ts: new Date().toISOString(),
        method: "POST",
        path: "/api/orders",
        status: 429,
        ms: Date.now() - started,
      });
      return NextResponse.json(
        { message: "ส่งคำสั่งซื้อบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = result.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ message: "สินค้าไม่เพียงพอ" }, { status: 400 });
    }

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId,
          productId: product.id,
          quantity,
          amount: product.price * quantity,
          status: "PAID",
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: quantity },
        },
      }),
    ]);

    pushRequestMetric({
      ts: new Date().toISOString(),
      method: "POST",
      path: "/api/orders",
      status: 200,
      ms: Date.now() - started,
    });

    // Log order activity
    await logOrder(userId, product.name, product.price * quantity);

    return NextResponse.json({
      order,
      message: "สั่งซื้อสำเร็จแล้ว",
    });
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
