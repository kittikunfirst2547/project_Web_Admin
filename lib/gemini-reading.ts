import { GoogleGenerativeAI } from "@google/generative-ai";

export type ReadingSections = {
  overall: string;
  career: string;
  money: string;
  love: string;
  health: string;
  advice: string;
};

const MODEL_ID = "gemini-2.0-flash";

export class GeminiReadingError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeminiReadingError";
    this.status = status;
  }
}

function toGeminiReadingError(err: unknown): GeminiReadingError {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("429") || /quota|rate[- ]?limit/i.test(message)) {
    return new GeminiReadingError(
      "โควต้า Gemini API หมดหรือถูกจำกัดชั่วคราว กรุณารอสักครู่หรือตรวจสอบ API key/billing ใน Google AI Studio",
      429
    );
  }

  if (message.includes("403") || /permission|api key/i.test(message)) {
    return new GeminiReadingError(
      "Gemini API key ใช้งานไม่ได้หรือไม่มีสิทธิ์ กรุณาตรวจสอบค่า GEMINI_API_KEY ในไฟล์ .env",
      502
    );
  }

  return new GeminiReadingError(
    "เรียก Gemini API ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    502
  );
}

export async function generateReadingSections(params: {
  apiKey: string;
  name: string;
  birthdate: string;
  birthtime?: string | null;
}): Promise<ReadingSections> {
  const { apiKey, name, birthdate, birthtime } = params;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const timePart = birthtime
    ? ` เวลาเกิดประมาณ ${birthtime}`
    : " ไม่ระบุเวลาเกิด";

  const prompt = `คุณเป็นโหราศาสตร์ไทยมืออาชีพ ให้คำทำนายดวงชะตาส่วนบุคคลเป็นภาษาไทยอย่างละเอียดและเป็นมิตร

ข้อมูล: ชื่อ ${name} เกิดวันที่ ${birthdate}${timePart}

คำตอบต้องเป็น JSON เท่านั้น (ไม่มี markdown ไม่มีข้อความอื่นนำหน้าหรือต่อท้าย) โครงสร้างนี้พอดี:
{"overall":"...","career":"...","money":"...","love":"...","health":"...","advice":"..."}

แต่ละฟิลด์เป็นข้อความภาษาไทย 2–5 ประโยค:
- overall = ดวงชะตาโดยรวม
- career = การงาน
- money = การเงิน
- love = ความรักและความสัมพันธ์
- health = สุขภาพ
- advice = คำแนะนำเสริมดวง`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    throw toGeminiReadingError(err);
  }
  let text = result.response.text().trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      overall: text,
      career: "—",
      money: "—",
      love: "—",
      health: "—",
      advice: "—",
    };
  }

  const o = parsed as Record<string, unknown>;
  const pick = (k: keyof ReadingSections) =>
    typeof o[k] === "string" ? (o[k] as string) : "—";

  return {
    overall: pick("overall"),
    career: pick("career"),
    money: pick("money"),
    love: pick("love"),
    health: pick("health"),
    advice: pick("advice"),
  };
}
