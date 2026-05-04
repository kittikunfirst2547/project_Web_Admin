import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  description: z.string().min(1, "กรุณากรอกคำอธิบาย"),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, description, price, stock, category, isActive, imageUrl } = parsed.data;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      category,
      isActive: isActive ?? true,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json({ product });
}
