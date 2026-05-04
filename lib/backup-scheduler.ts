import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

const DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * ตรวจสอบว่า backup scheduler ควรทำงานตอนนี้หรือไม่
 */
export function shouldRunSchedule(schedule: {
  time: string;
  days: string[];
  lastRunAt: Date | null;
}): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...

  // แปลงเวลาจาก schedule (HH:mm)
  const [scheduleHour, scheduleMinute] = schedule.time.split(":").map(Number);

  // เช็คว่าวันนี้ต้อง backup ไหม
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayName = dayNames[currentDay];
  if (!schedule.days.includes(todayName)) {
    return false;
  }

  // เช็คว่าเวลาตรงกับที่ตั้งไว้ไหม (allow 1 minute window)
  if (currentHour !== scheduleHour || Math.abs(currentMinute - scheduleMinute) > 1) {
    return false;
  }

  // เช็คว่าเพิ่ง backup ไปแล้วหรือยัง (กัน double backup)
  if (schedule.lastRunAt) {
    const lastRun = new Date(schedule.lastRunAt);
    const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60);
    if (minutesSinceLastRun < 5) {
      return false; // กัน backup ซ้ำภายใน 5 นาที
    }
  }

  return true;
}

/**
 * สร้าง backup ตาม schedule
 */
async function createScheduledBackup(scheduleId: string, keepCount: number): Promise<boolean> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // ดึงข้อมูลทุก table
    const [users, readings, products, orders, aiUsageLogs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isDeleted: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.reading.findMany(),
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.aIUsageLog.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      exportedBy: "system-scheduled",
      version: "1.0",
      scheduleId,
      tables: {
        users,
        readings,
        products,
        orders,
        aiUsageLogs,
      },
      counts: {
        users: users.length,
        readings: readings.length,
        products: products.length,
        orders: orders.length,
        aiUsageLogs: aiUsageLogs.length,
      },
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `scheduled_backup_${stamp}.json`;
    const dest = path.join(BACKUP_DIR, filename);

    await fs.writeFile(dest, JSON.stringify(backup, null, 2), "utf-8");

    // ลบ backup เก่าเกิน keepCount
    const allFiles = (await fs.readdir(BACKUP_DIR))
      .filter((n) => n.startsWith("scheduled_backup_") && n.endsWith(".json"))
      .sort()
      .reverse();

    if (allFiles.length > keepCount) {
      const toDelete = allFiles.slice(keepCount);
      await Promise.all(
        toDelete.map((f) => fs.unlink(path.join(BACKUP_DIR, f)))
      );
    }

    console.log(`[ScheduledBackup] Created ${filename}`);
    return true;
  } catch (err) {
    console.error("[ScheduledBackup] Error creating backup:", err);
    return false;
  }
}

/**
 * รัน scheduled backups ทั้งหมดที่ถึงเวลา
 */
export async function runScheduledBackups(): Promise<void> {
  try {
    // ดึง schedules ที่ active
    const schedules = await prisma.scheduledBackup.findMany({
      where: { isActive: true },
    });

    for (const schedule of schedules) {
      if (shouldRunSchedule(schedule)) {
        console.log(`[ScheduledBackup] Running schedule: ${schedule.name} (${schedule.time})`);

        const success = await createScheduledBackup(schedule.id, schedule.keepCount);

        // อัปเดต last run status
        await prisma.scheduledBackup.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: new Date(),
            lastRunStatus: success ? "success" : "failed",
          },
        });

        if (success) {
          console.log(`[ScheduledBackup] ${schedule.name} completed successfully`);
        } else {
          console.error(`[ScheduledBackup] ${schedule.name} failed`);
        }
      }
    }
  } catch (err) {
    console.error("[ScheduledBackup] Error in scheduler:", err);
  }
}

/**
 * เริ่มต้น scheduler (รันทุก 1 นาที)
 */
export function startBackupScheduler(): NodeJS.Timeout {
  console.log("[ScheduledBackup] Scheduler started");

  // รันทันทีครั้งแรก
  runScheduledBackups();

  // รันทุก 1 นาที
  const interval = setInterval(runScheduledBackups, 60 * 1000);

  return interval;
}

/**
 * หยุด scheduler
 */
export function stopBackupScheduler(interval: NodeJS.Timeout): void {
  clearInterval(interval);
  console.log("[ScheduledBackup] Scheduler stopped");
}
