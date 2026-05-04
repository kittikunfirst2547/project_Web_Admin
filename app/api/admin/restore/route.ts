// app/api/admin/restore/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_DIR = path.join(process.cwd(), "backups");

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
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
        await db.product.upsert({
          where:  { id: p.id },
          create: p,
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
        const exists = await db.user.findUnique({ where: { id: u.id } });
        if (!exists) {
          // user ใหม่ที่ไม่มีในระบบ — ต้องมี password
          // ตั้ง default password แล้วให้ reset
          const defaultPwd = await bcrypt.hash("Reset@1234", 12);
          await db.user.create({
            data: {
              id:        u.id,
              name:      u.name,
              email:     u.email,
              password:  defaultPwd,
              role:      u.role,
              isDeleted: u.isDeleted,
              isBanned:  u.isBanned,
              createdAt: new Date(u.createdAt),
            },
          });
        } else {
          // อัปเดตเฉพาะ name, role, isDeleted, isBanned
          await db.user.update({
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
        const exists = await db.reading.findUnique({ where: { id: r.id } });
        if (!exists) {
          await db.reading.create({ data: r });
          count++;
        }
      }
      results.readings = count;
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