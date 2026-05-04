import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecentRequestMetrics } from "@/lib/runtime-metrics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const mem = process.memoryUsage();

  const errorLogs = await prisma.log.findMany({
    where: { level: "error" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const requestLogs = getRecentRequestMetrics();

  return NextResponse.json({
    dbOk,
    uptimeSec: Math.round(process.uptime()),
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
    },
    avgResponseMs:
      requestLogs.length > 0
        ? Math.round(
            requestLogs.reduce((s, r) => s + r.ms, 0) / requestLogs.length
          )
        : null,
    requestLogs,
    errorLogs,
  });
}
