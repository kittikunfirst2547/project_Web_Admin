import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "จำเป็นต้องเข้าสู่ระบบ" }, { status: 401 });
  }

  const readings = await prisma.reading.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      clientName: true,
      birthDate: true,
      birthTime: true,
      createdAt: true,
      type: true,
    },
  });

  return NextResponse.json({ readings });
}
