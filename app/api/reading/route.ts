import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { generateGroqReading, type ReadingSections } from "@/lib/groq-reading";
import { withErrorHandler } from "@/lib/with-error-handler";
import { pushRequestMetric } from "@/lib/runtime-metrics";
import { logReading } from "@/lib/logger";

const readingSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  birthdate: z.string().min(1, "กรุณาเลือกวันเกิด"),
  birthtime: z.string().optional().nullable(),
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const ipHash = hashIp(getClientIp(req));
  const dateKey = todayKey();

  if (session?.user?.id) {
    return NextResponse.json({
      loggedIn: true,
      guestUsed: 0,
      guestLimit: 3,
    });
  }

  const row = await prisma.guestReadingQuota.findUnique({
    where: {
      ipHash_date: { ipHash, date: dateKey },
    },
  });

  return NextResponse.json({
    loggedIn: false,
    guestUsed: row?.count ?? 0,
    guestLimit: 3,
  });
}

export async function POST(req: Request) {
  const started = Date.now();
  return withErrorHandler(async () => {
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const dateKey = todayKey();

    const rl = await rateLimit(`reading_ip_${ipHash}`, 10, 60_000);
    if (!rl.success) {
      pushRequestMetric({
        ts: new Date().toISOString(),
        method: "POST",
        path: "/api/reading",
        status: 429,
        ms: Date.now() - started,
      });
      return NextResponse.json(
        { message: "เรียกดูดวงบ่อยเกินไป กรุณารอสักครู่" },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const parsed = readingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, birthdate, birthtime } = parsed.data;
    const birthTimeNorm =
      birthtime && String(birthtime).trim() !== ""
        ? String(birthtime).trim()
        : null;

    const cacheWhere = session?.user?.id
      ? {
          userId: session.user.id,
          clientName: name,
          birthDate: birthdate,
          birthTime: birthTimeNorm,
        }
      : {
          guestIpHash: ipHash,
          clientName: name,
          birthDate: birthdate,
          birthTime: birthTimeNorm,
        };

    const cachedRow = await prisma.reading.findFirst({
      where: cacheWhere,
      orderBy: { createdAt: "desc" },
    });

    if (cachedRow) {
      let sections: ReadingSections;
      try {
        sections = JSON.parse(cachedRow.response) as ReadingSections;
      } catch {
        sections = {
          overall: cachedRow.response,
          career: "—",
          money: "—",
          love: "—",
          health: "—",
          advice: "—",
        };
      }

      await prisma.aIUsageLog.create({
        data: {
          userId: session?.user?.id ?? null,
          ipHash,
          model: "llama-3.3-70b-specdec",
          cached: true,
        },
      });

      // Log reading activity (cached)
      await logReading(session?.user?.id ?? null, name, "AI_READING (cached)");

      const res = NextResponse.json({
        reading: sections,
        cached: true,
      });
      pushRequestMetric({
        ts: new Date().toISOString(),
        method: "POST",
        path: "/api/reading",
        status: 200,
        ms: Date.now() - started,
      });
      return res;
    }

    if (!session?.user?.id) {
      const quota = await prisma.guestReadingQuota.findUnique({
        where: {
          ipHash_date: { ipHash, date: dateKey },
        },
      });
      const used = quota?.count ?? 0;
      if (used >= 3) {
        pushRequestMetric({
          ts: new Date().toISOString(),
          method: "POST",
          path: "/api/reading",
          status: 429,
          ms: Date.now() - started,
        });
        return NextResponse.json(
          {
            message:
              "ผู้ใช้ที่ยังไม่เข้าสู่ระบบดูดวงได้ไม่เกิน 3 ครั้งต่อวัน กรุณาเข้าสู่ระบบเพื่อใช้งานเต็มรูปแบบ",
            guestLimitReached: true,
          },
          { status: 429 }
        );
      }
    }

    const sections = await generateGroqReading({
      apiKey: env.GROQ_API_KEY,
      name,
      birthdate,
      birthtime: birthTimeNorm,
    });

    const responseJson = JSON.stringify(sections);

    await prisma.reading.create({
      data: {
        userId: session?.user?.id ?? null,
        guestIpHash: session?.user?.id ? null : ipHash,
        clientName: name,
        birthDate: birthdate,
        birthTime: birthTimeNorm,
        prompt: `AI reading for ${name} ${birthdate} ${birthTimeNorm ?? ""}`,
        response: responseJson,
        type: "AI_READING",
      },
    });

    await prisma.aIUsageLog.create({
      data: {
        userId: session?.user?.id ?? null,
        ipHash,
        model: "llama-3.3-70b-specdec",
        cached: false,
      },
    });

    if (!session?.user?.id) {
      await prisma.guestReadingQuota.upsert({
        where: { ipHash_date: { ipHash, date: dateKey } },
        create: { ipHash, date: dateKey, count: 1 },
        update: { count: { increment: 1 } },
      });
    }

    // Log reading activity (new)
    await logReading(session?.user?.id ?? null, name, "AI_READING");

    const res = NextResponse.json({
      reading: sections,
      cached: false,
    });
    pushRequestMetric({
      ts: new Date().toISOString(),
      method: "POST",
      path: "/api/reading",
      status: 200,
      ms: Date.now() - started,
    });
    return res;
  });
}
