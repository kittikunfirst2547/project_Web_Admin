import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Rate limit: 100 requests per hour (3,600,000 ms)
    const { success } = await rateLimit(`admin_logs_${userId}`, 100, 3600000);
    
    if (!success) {
      return NextResponse.json(
        { message: "ส่งคำขอมากเกินไป กรุณาลองใหม่ในภายหลัง" },
        { status: 429 }
      );
    }

    const logs = await prisma.log.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[ADMIN_LOGS_GET]", error);
    return NextResponse.json({ message: "Error fetching logs" }, { status: 500 });
  }
}

