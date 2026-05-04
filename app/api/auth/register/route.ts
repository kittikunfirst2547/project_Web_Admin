import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { logRegister } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per 15 minutes (900,000 ms)
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`register_${ip}`, 5, 900000);
    
    if (!success) {
      return NextResponse.json(
        { message: "ส่งคำขอมากเกินไป กรุณาลองใหม่ในอีก 15 นาที" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "อีเมลนี้มีผู้ใช้งานแล้ว" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    // Log user registration
    await logRegister(user.id, user.email);

    return NextResponse.json(
      { message: "ลงทะเบียนสำเร็จ", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

