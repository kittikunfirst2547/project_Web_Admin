// app/api/admin/restore/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma  } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ใช้ /tmp สำหรับ serverless environment (Vercel), มิฉะนั้นใช้ process.cwd()
const BACKUP_DIR = process.env.VERCEL 
  ? "/tmp/backups" 
  : path.join(process.cwd(), "backups");

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

/**
 * แปลง DateTime strings จาก JSON กลับเป็น Date objects
 * Prisma ต้องการ Date object ไม่ใช่ string
 */
function parseDate(value: any): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

// ─── GET — preview backup file ────────────────────────────────
export async function GET(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename || filename.includes("..") || !filename.endsWith(".json")) {
    return NextResponse.json({ message: "ชื่อไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const filePath = path.join(BACKUP_DIR, filename);
    const raw      = await fs.readFile(filePath, "utf-8");
    const data     = JSON.parse(raw);

    // return แค่ summary ไม่เอา data จริง
    return NextResponse.json({
      filename,
      exportedAt: data.exportedAt,
      exportedBy: data.exportedBy,
      version:    data.version,
      counts:     data.counts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "อ่านไฟล์ไม่สำเร็จ: " + err.message },
      { status: 500 }
    );
  }
}

// ─── POST — restore from backup ───────────────────────────────
export async function POST(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const { filename, confirm } = await req.json();

    if (!confirm) {
      return NextResponse.json(
        { message: "กรุณายืนยันการ restore (confirm: true)" },
        { status: 400 }
      );
    }

    if (!filename || filename.includes("..") || !filename.endsWith(".json")) {
      return NextResponse.json(
        { message: "ชื่อไฟล์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const filePath = path.join(BACKUP_DIR, filename);
    const raw      = await fs.readFile(filePath, "utf-8");
    const backup   = JSON.parse(raw);

    const { tables } = backup;

    if (!tables) {
      return NextResponse.json(
        { message: "ไฟล์ backup ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const results: Record<string, number> = {};

    // Restore products (ไม่ลบของเดิม — upsert)
    if (tables.products?.length) {
      let count = 0;
      for (const p of tables.products) {
        await prisma.product.upsert({
          where:  { id: p.id },
          create: {
            id:          p.id,
            name:        p.name,
            description: p.description,
            price:       p.price,
            stock:       p.stock,
            category:    p.category,
            isActive:    p.isActive,
            imageUrl:    p.imageUrl || null,
            createdAt:   parseDate(p.createdAt),
            updatedAt:   parseDate(p.updatedAt) || new Date(),
          },
          update: {
            name:        p.name,
            description: p.description,
            price:       p.price,
            stock:       p.stock,
            category:    p.category,
            isActive:    p.isActive,
          },
        });
        count++;
      }
      results.products = count;
    }

    // Restore users (upsert — ไม่ overwrite password)
    if (tables.users?.length) {
      let count = 0;
      for (const u of tables.users) {
        const exists = await prisma.user.findUnique({ where: { id: u.id } });
        if (!exists) {
          // user ใหม่ที่ไม่มีในระบบ — ต้องมี password
          // ตั้ง default password แล้วให้ reset
          const defaultPwd = await bcrypt.hash("Reset@1234", 12);
          await prisma.user.create({
            data: {
              id:        u.id,
              name:      u.name,
              email:     u.email,
              password:  defaultPwd,
              role:      u.role,
              isDeleted: u.isDeleted,
              isBanned:  u.isBanned,
              createdAt: parseDate(u.createdAt),
            },
          });
        } else {
          // อัปเดตเฉพาะ name, role, isDeleted, isBanned
          await prisma.user.update({
            where: { id: u.id },
            data: {
              name:      u.name,
              role:      u.role,
              isDeleted: u.isDeleted,
              isBanned:  u.isBanned,
            },
          });
        }
        count++;
      }
      results.users = count;
    }

    // Restore readings (insert ถ้ายังไม่มี)
    if (tables.readings?.length) {
      let count = 0;
      for (const r of tables.readings) {
        const exists = await prisma.reading.findUnique({ where: { id: r.id } });
        if (!exists) {
          await prisma.reading.create({
            data: {
              id:          r.id,
              userId:      r.userId || null,
              guestIpHash: r.guestIpHash || null,
              clientName:  r.clientName,
              birthDate:   r.birthDate,
              birthTime:   r.birthTime || null,
              prompt:      r.prompt,
              response:    r.response,
              type:        r.type,
              createdAt:   parseDate(r.createdAt),
            },
          });
          count++;
        }
      }
      results.readings = count;
    }

    // Restore orders (insert ถ้ายังไม่มี)
    if (tables.orders?.length) {
      let count = 0;
      for (const o of tables.orders) {
        const exists = await prisma.order.findUnique({ where: { id: o.id } });
        if (!exists) {
          await prisma.order.create({
            data: {
              id:        o.id,
              userId:    o.userId,
              productId: o.productId,
              quantity:  o.quantity,
              status:    o.status,
              amount:    o.amount,
              createdAt: parseDate(o.createdAt),
              updatedAt: parseDate(o.updatedAt) || new Date(),
            },
          });
          count++;
        }
      }
      results.orders = count;
    }

    // Restore aiUsageLogs (insert ถ้ายังไม่มี)
    if (tables.aiUsageLogs?.length) {
      let count = 0;
      for (const log of tables.aiUsageLogs) {
        const exists = await prisma.aIUsageLog.findUnique({ where: { id: log.id } });
        if (!exists) {
          await prisma.aIUsageLog.create({
            data: {
              id:        log.id,
              userId:    log.userId || null,
              ipHash:    log.ipHash || null,
              model:     log.model,
              cached:    log.cached ?? false,
              createdAt: parseDate(log.createdAt),
            },
          });
          count++;
        }
      }
      results.aiUsageLogs = count;
    }

    // Restore logs (insert ถ้ายังไม่มี — v1.1+)
    if (tables.logs?.length) {
      let count = 0;
      for (const l of tables.logs) {
        const exists = await prisma.log.findUnique({ where: { id: l.id } });
        if (!exists) {
          await prisma.log.create({
            data: {
              id:        l.id,
              userId:    l.userId || null,
              action:    l.action,
              details:   l.details || null,
              level:     l.level || "info",
              path:      l.path || null,
              createdAt: parseDate(l.createdAt),
            },
          });
          count++;
        }
      }
      results.logs = count;
    }

    // Restore guestQuotas (upsert — v1.1+)
    if (tables.guestQuotas?.length) {
      let count = 0;
      for (const q of tables.guestQuotas) {
        await prisma.guestReadingQuota.upsert({
          where: {
            ipHash_date: { ipHash: q.ipHash, date: q.date },
          },
          create: {
            ipHash: q.ipHash,
            date:   q.date,
            count:  q.count,
          },
          update: {
            count: q.count,
          },
        });
        count++;
      }
      results.guestQuotas = count;
    }

    // Restore scheduledBackups (upsert — v1.1+)
    if (tables.scheduledBackups?.length) {
      let count = 0;
      for (const s of tables.scheduledBackups) {
        await prisma.scheduledBackup.upsert({
          where: { id: s.id },
          create: {
            id:            s.id,
            name:          s.name,
            time:          s.time,
            days:          s.days,
            isActive:      s.isActive,
            keepCount:     s.keepCount,
            createdBy:     s.createdBy,
            createdAt:     parseDate(s.createdAt),
            updatedAt:     parseDate(s.updatedAt) || new Date(),
            lastRunAt:     parseDate(s.lastRunAt),
            lastRunStatus: s.lastRunStatus || null,
          },
          update: {
            name:          s.name,
            time:          s.time,
            days:          s.days,
            isActive:      s.isActive,
            keepCount:     s.keepCount,
          },
        });
        count++;
      }
      results.scheduledBackups = count;
    }

    return NextResponse.json({
      message: "restore สำเร็จ",
      restored: results,
    });
  } catch (err: any) {
    console.error("[restore]", err);
    return NextResponse.json(
      { message: "restore ไม่สำเร็จ: " + err.message },
      { status: 500 }
    );
  }
}