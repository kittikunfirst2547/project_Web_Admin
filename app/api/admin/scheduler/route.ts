// app/api/admin/scheduler/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runScheduledBackups } from "@/lib/backup-scheduler";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "admin") return null;
  return session;
}

// POST — trigger scheduled backups manually (for testing)
export async function POST() {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    await runScheduledBackups();
    return NextResponse.json({ message: "รัน scheduled backups แล้ว" });
  } catch (err) {
    console.error("[scheduler:trigger]", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
