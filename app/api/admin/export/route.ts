// app/api/admin/backup/download/route.ts
// ดาวน์โหลดไฟล์ backup โดยตรง
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_DIR = path.join(process.cwd(), "backups");

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename || filename.includes("..") || !filename.endsWith(".json")) {
    return NextResponse.json({ message: "ชื่อไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const filePath = path.join(BACKUP_DIR, filename);
    const content  = await fs.readFile(filePath);

    return new NextResponse(content, {
      headers: {
        "Content-Type":        "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
  }
}