import Groq from "groq-sdk";

export type ReadingSections = {
  overall: string;
  career: string;
  money: string;
  love: string;
  health: string;
  advice: string;
};

const MODEL_ID = "llama-3.3-70b-versatile"; // หรือใช้ "llama-3.1-8b-instant" เพื่อความเร็วสูงสุด

export async function generateGroqReading(params: {
  apiKey: string;
  name: string;
  birthdate: string;
  birthtime?: string | null;
}): Promise<ReadingSections> {
  const { apiKey, name, birthdate, birthtime } = params;
  const groq = new Groq({ apiKey });

  const timePart = birthtime
    ? ` เวลาเกิดประมาณ ${birthtime}`
    : " ไม่ระบุเวลาเกิด";

  const prompt = `คุณเป็นโหราศาสตร์ไทยมืออาชีพ ให้คำทำนายดวงชะตาส่วนบุคคลเป็นภาษาไทยอย่างละเอียดและเป็นมิตร

ข้อมูล: ชื่อ ${name} เกิดวันที่ ${birthdate}${timePart}

คำตอบต้องเป็น JSON เท่านั้น (ไม่มี markdown ไม่มีข้อความอื่นนำหน้าหรือต่อท้าย) โครงสร้างนี้เท่านั้น:
{"overall":"...","career":"...","money":"...","love":"...","health":"...","advice":"..."}

แต่ละฟิลด์เป็นข้อความภาษาไทย 2–4 ประโยค:
- overall = ดวงชะตาโดยรวม
- career = การงาน
- money = การเงิน
- love = ความรักและความสัมพันธ์
- health = สุขภาพ
- advice = คำแนะนำเสริมดวง`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional Thai astrologer who always responds in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL_ID,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    const pick = (k: keyof ReadingSections) =>
      typeof parsed[k] === "string" ? parsed[k] : "—";

    return {
      overall: pick("overall"),
      career: pick("career"),
      money: pick("money"),
      love: pick("love"),
      health: pick("health"),
      advice: pick("advice"),
    };
  } catch (err) {
    console.error("[GROQ_ERROR]", err);
    throw new Error("เรียกใช้งาน Groq AI ไม่สำเร็จ กรุณาตรวจสอบ API Key หรือลองใหม่อีกครั้ง");
  }
}
