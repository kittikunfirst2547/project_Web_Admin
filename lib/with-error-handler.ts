import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GeminiReadingError } from "@/lib/gemini-reading";

export async function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    if (err instanceof ZodError) {
      const msg = err.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
      return NextResponse.json({ message: msg }, { status: 400 });
    }
    if (err instanceof GeminiReadingError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("[API]", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
