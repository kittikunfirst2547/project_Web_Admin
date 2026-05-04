import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ReadingSections } from "@/lib/gemini-reading";

const saveSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  birthdate: z.string().min(1, "กรุณาระบุวันเกิด"),
  birthtime: z.string().optional().nullable(),
  result: z.object({
    overall: z.string(),
    career: z.string(),
    money: z.string(),
    love: z.string(),
    health: z.string(),
    advice: z.string(),
  }),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "จำเป็นต้องเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, birthdate, birthtime, result } = parsed.data;
  const birthTimeNorm =
    birthtime && String(birthtime).trim() !== ""
      ? String(birthtime).trim()
      : null;

  const data: ReadingSections = result;

  await prisma.reading.create({
    data: {
      userId: session.user.id,
      guestIpHash: null,
      clientName: name,
      birthDate: birthdate,
      birthTime: birthTimeNorm,
      prompt: `บันทึกผลดวงด้วยตนเอง — ${name}`,
      response: JSON.stringify(data),
      type: "AI_READING_SAVED",
    },
  });

  return NextResponse.json({ message: "บันทึกผลดวงเรียบร้อยแล้ว" });
}
