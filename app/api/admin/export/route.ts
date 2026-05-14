// app/api/admin/export/route.ts
// Export users or readings as JSON download
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_DIR = process.env.VERCEL
  ? "/tmp/backups"
  : path.join(process.cwd(), "backups");

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const filename = searchParams.get("filename");

  // ─── Download backup file ─────────────────────────────────────
  if (filename) {
    if (filename.includes("..") || !filename.endsWith(".json")) {
      return NextResponse.json({ message: "ชื่อไฟล์ไม่ถูกต้อง" }, { status: 400 });
    }

    try {
      const filePath = path.join(BACKUP_DIR, filename);
      const content = await fs.readFile(filePath);

      return new NextResponse(content, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch {
      return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
    }
  }

  // ─── Export by type ────────────────────────────────────────────
  try {
    if (type === "users") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return new NextResponse(JSON.stringify({ users, total: users.length, exportedAt: new Date().toISOString() }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    if (type === "readings") {
      const readings = await prisma.reading.findMany({
        orderBy: { createdAt: "desc" },
      });

      return new NextResponse(JSON.stringify({ readings, total: readings.length, exportedAt: new Date().toISOString() }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="readings-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    return NextResponse.json(
      { message: "กรุณาระบุ type (users หรือ readings) หรือ filename" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[export]", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด: " + err.message },
      { status: 500 }
    );
  }
}