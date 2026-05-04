import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  isBanned: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "ไม่มีข้อมูลที่จะอัปเดต" }, { status: 400 });
  }

  if (params.id === session.user.id && data.role === "user") {
    return NextResponse.json(
      { message: "ไม่สามารถลดสิทธิ์ตนเองได้" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ message: "อัปเดตผู้ใช้แล้ว" });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ message: "ไม่สามารถลบบัญชีตนเองได้" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { isDeleted: true },
  });

  return NextResponse.json({ message: "ลบผู้ใช้ (นิรภัย) แล้ว" });
}
