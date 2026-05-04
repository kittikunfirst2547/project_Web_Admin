// app/api/admin/backup/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_DIR = path.join(process.cwd(), "backups");

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "admin") return null;
  return session;
}

// ─── GET — list backups ───────────────────────────────────────
export async function GET() {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const names = await fs.readdir(BACKUP_DIR);

    const rows = await Promise.all(
      names
        .filter((n) => n.endsWith(".json"))
        .map(async (name) => {
          const st = await fs.stat(path.join(BACKUP_DIR, name));
          return {
            filename: name,
            sizeKB:   Math.round(st.size / 1024),
            date:     st.mtime.toISOString(),
          };
        })
    );

    rows.sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({ backups: rows });
  } catch (err) {
    console.error("[backup:list]", err);
    return NextResponse.json(
      { message: "โหลดรายการ backup ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// ─── POST — create backup ─────────────────────────────────────
export async function POST() {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // ดึงข้อมูลทุก table
    const [users, readings, products, orders, aiUsageLogs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          isDeleted: true,
          isBanned:  true,
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
      exportedBy: session.user.email,
      version:    "1.0",
      tables: {
        users,
        readings,
        products,
        orders,
        aiUsageLogs,
      },
      counts: {
        users:       users.length,
        readings:    readings.length,
        products:    products.length,
        orders:      orders.length,
        aiUsageLogs: aiUsageLogs.length,
      },
    };

    const stamp    = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `backup_${stamp}.json`;
    const dest     = path.join(BACKUP_DIR, filename);

    await fs.writeFile(dest, JSON.stringify(backup, null, 2), "utf-8");

    // เก็บแค่ 10 backup ล่าสุด ลบอันเก่า
    const allFiles = (await fs.readdir(BACKUP_DIR))
      .filter((n) => n.endsWith(".json"))
      .sort()
      .reverse();

    if (allFiles.length > 10) {
      const toDelete = allFiles.slice(10);
      await Promise.all(
        toDelete.map((f) => fs.unlink(path.join(BACKUP_DIR, f)))
      );
    }

    const stat = await fs.stat(dest);

    return NextResponse.json({
      message:  "สำรองข้อมูลสำเร็จ",
      filename,
      sizeKB:   Math.round(stat.size / 1024),
      counts:   backup.counts,
    });
  } catch (err: any) {
    console.error("[backup:create]", err);
    return NextResponse.json(
      { message: "สำรองข้อมูลไม่สำเร็จ: " + err.message },
      { status: 500 }
    );
  }
}

// ─── DELETE — delete backup file ─────────────────────────────
export async function DELETE(req: Request) {
  const session = await ensureAdmin();
  if (!session) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  try {
    const { filename } = await req.json();

    // ป้องกัน path traversal
    if (!filename || filename.includes("..") || !filename.endsWith(".json")) {
      return NextResponse.json(
        { message: "ชื่อไฟล์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const filePath = path.join(BACKUP_DIR, filename);
    await fs.unlink(filePath);

    return NextResponse.json({ message: "ลบ backup สำเร็จ" });
  } catch (err: any) {
    console.error("[backup:delete]", err);
    return NextResponse.json(
      { message: "ลบไม่สำเร็จ: " + err.message },
      { status: 500 }
    );
  }
}