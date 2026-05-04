import fs from "fs";
import path from "path";

/** แปลง DATABASE_URL แบบ SQLite เป็น path บนดิสก์ */
export function sqliteFileAbsolutePath(): string {
  const url = process.env.DATABASE_URL ?? "";
  let raw = url.replace(/^file:/i, "").trim();
  if (!raw) {
    throw new Error("DATABASE_URL ไม่ถูกต้อง");
  }
  if (raw.startsWith("./")) {
    raw = raw.slice(2);
  }

  const fromRoot = path.resolve(process.cwd(), raw);
  const fromPrisma = path.resolve(process.cwd(), "prisma", raw);

  if (fs.existsSync(fromPrisma)) {
    return fromPrisma;
  }
  if (fs.existsSync(fromRoot)) {
    return fromRoot;
  }

  return fromPrisma;
}
