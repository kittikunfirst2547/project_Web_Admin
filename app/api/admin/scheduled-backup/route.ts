// app/api/admin/scheduled-backup/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DAY_OPTIONS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const scheduleSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อ").max(50),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "เวลาต้องอยู่ในรูปแบบ HH:mm"),
  days: z.array(z.enum(DAY_OPTIONS)).min(1, "กรุณาเลือกอย่างน้อย 1 วัน"),
  isActive: z.boolean().default(true),
  keepCount: z.number().int().min(1).max(50).default(10),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "admin") return null;
  return session;
}

// GET — list all scheduled backups
export async function GET() {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const schedules = await prisma.scheduledBackup.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ schedules });
  } catch (err) {
    console.error("[scheduled-backup:list]", err);
    return NextResponse.json(
      { message: "โหลดรายการไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// POST — create new scheduled backup
export async function POST(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = scheduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const schedule = await prisma.scheduledBackup.create({
      data: {
        ...result.data,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "สร้าง schedule สำเร็จ", schedule },
      { status: 201 }
    );
  } catch (err) {
    console.error("[scheduled-backup:create]", err);
    return NextResponse.json(
      { message: "สร้างไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// PUT — update scheduled backup
export async function PUT(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "กรุณาระบุ ID" },
        { status: 400 }
      );
    }

    const result = scheduleSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const schedule = await prisma.scheduledBackup.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ message: "อัปเดตสำเร็จ", schedule });
  } catch (err) {
    console.error("[scheduled-backup:update]", err);
    return NextResponse.json(
      { message: "อัปเดตไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// DELETE — delete scheduled backup
export async function DELETE(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "กรุณาระบุ ID" },
        { status: 400 }
      );
    }

    await prisma.scheduledBackup.delete({
      where: { id },
    });

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    console.error("[scheduled-backup:delete]", err);
    return NextResponse.json(
      { message: "ลบไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
