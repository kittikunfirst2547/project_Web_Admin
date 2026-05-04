import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z
  .object({
    name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร").optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.oldPassword) return false;
      if (data.oldPassword && !data.newPassword) return false;
      return true;
    },
    {
      message: "กรุณากรอกทั้งรหัสผ่านเดิมและรหัสผ่านใหม่",
      path: ["newPassword"],
    }
  );

async function handleProfileUpdate(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "จำเป็นต้องเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await req.json();
  const result = profileSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, oldPassword, newPassword } = result.data;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  const updateData: { name?: string; password?: string } = {};

  if (name) {
    updateData.name = name;
  }

  if (oldPassword && newPassword) {
    if (!user.password) {
      return NextResponse.json(
        { message: "ผู้ใช้ไม่ได้ล็อกอินด้วยรหัสผ่าน" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" }, { status: 400 });
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: updateData,
  });

  return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ" }, { status: 200 });
}

export async function PUT(req: Request) {
  try {
    return await handleProfileUpdate(req);
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    return await handleProfileUpdate(req);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}
