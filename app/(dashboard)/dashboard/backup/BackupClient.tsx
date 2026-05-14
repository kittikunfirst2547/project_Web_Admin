import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BackupActions from "./BackupActions";
import ScheduledBackupPanel from "./ScheduledBackupPanel";

type BackupRow = { filename: string; sizeKB: number; date: string };

export default async function BackupClient() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return <div>ไม่มีสิทธิ์เข้าถึง</div>;
  }

  // ดึงข้อมูล backup จาก server โดยตรง (ไม่หายเมื่อ refresh)
  const BACKUP_DIR = process.env.VERCEL ? "/tmp/backups" : require("path").join(process.cwd(), "backups");
  const fs = require("fs");
  const path = require("path");

  let backups: BackupRow[] = [];
  try {
    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR);
      backups = files
        .filter((f: string) => f.endsWith(".json"))
        .map((f: string) => {
          const stat = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            filename: f,
            sizeKB: Math.round(stat.size / 1024),
            date: stat.mtime.toISOString(),
          };
        })
        .sort((a: BackupRow, b: BackupRow) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (e) {
    console.error("[BACKUP_LIST_ERROR]", e);
  }

  return (
    <div className="space-y-8">
      <ScheduledBackupPanel />

      <div 
        className="border-t pt-6" 
        style={{ borderColor: 'var(--border-subtle)' }} 
      />

      <BackupActions backups={backups} />
    </div>
  );
}
