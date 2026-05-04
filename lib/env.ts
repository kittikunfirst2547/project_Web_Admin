import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "ตั้งค่า DATABASE_URL ใน .env"),
  NEXTAUTH_SECRET: z.string().min(1, "ตั้งค่า NEXTAUTH_SECRET ใน .env"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL ต้องเป็น URL เช่น http://localhost:3000"),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().min(1, "ตั้งค่า GROQ_API_KEY ใน .env"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ ตัวแปรสภาพแวดล้อมไม่ถูกต้อง:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error(
    "กรุณาตรวจสอบไฟล์ .env (คัดลอกจาก .env.example) และตั้งค่าให้ครบ"
  );
}

export const env = parsed.data;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
