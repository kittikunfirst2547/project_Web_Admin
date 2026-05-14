import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecentRequestMetrics } from "@/lib/runtime-metrics";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accessPage = parseInt(searchParams.get("accessPage") || "1", 10);
  const accessLimit = parseInt(searchParams.get("accessLimit") || "20", 10);
  const accessFilter = searchParams.get("accessFilter") || "";

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

  // ─── Access Logs from DB ───────────────────────────────────
  const accessWhere: any = { action: "PAGE_ACCESS" };
  if (accessFilter) {
    accessWhere.path = { contains: accessFilter };
  }

  const [accessLogs, accessTotal] = await Promise.all([
    prisma.log.findMany({
      where: accessWhere,
      orderBy: { createdAt: "desc" },
      skip: (accessPage - 1) * accessLimit,
      take: accessLimit,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.log.count({ where: accessWhere }),
  ]);

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
    accessLogs: accessLogs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name || log.user?.email || null,
      path: log.path,
      method: log.details?.split(" ")[0] || "GET",
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    })),
    accessTotal,
    accessPage,
    accessLimit,
  });
}
