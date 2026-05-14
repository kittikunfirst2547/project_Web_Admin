import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST — บันทึก access log (เรียกจาก middleware)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, path, method } = body;

    await prisma.log.create({
      data: {
        userId: userId || undefined,
        action: "PAGE_ACCESS",
        details: `${method} ${path}`,
        level: "info",
        path,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACCESS_LOG_ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET — ดึง access logs พร้อม pagination + filter
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const pathFilter = searchParams.get("path") || "";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const where: any = { action: "PAGE_ACCESS" };

  if (pathFilter) {
    where.path = { contains: pathFilter };
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }

  try {
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.log.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.name || log.user?.email || null,
        path: log.path,
        method: log.details?.split(" ")[0] || "GET",
        details: log.details,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ACCESS_LOG_GET_ERROR]", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
