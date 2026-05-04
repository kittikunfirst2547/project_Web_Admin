"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

type ReadingSections = {
  overall: string;
  career: string;
  money: string;
  love: string;
  health: string;
  advice: string;
};

const SECTIONS: { key: keyof ReadingSections; title: string; icon: string; color: string }[] = [
  { key: "overall", title: "ดวงชะตาโดยรวม", icon: "✨", color: "#a78bfa" },
  { key: "career", title: "การงาน", icon: "💼", color: "#60a5fa" },
  { key: "money", title: "การเงิน", icon: "💰", color: "#34d399" },
  { key: "love", title: "ความรัก", icon: "💕", color: "#f472b6" },
  { key: "health", title: "สุขภาพ", icon: "🌟", color: "#fbbf24" },
  { key: "advice", title: "คำแนะนำ", icon: "🔮", color: "#a78bfa" },
];

export default function ReadingPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<ReadingSections | null>(null);
  const [cached, setCached] = useState(false);
  const [quota, setQuota] = useState<{ guestUsed: number; guestLimit: number; loggedIn: boolean } | null>(null);

  const refreshQuota = async () => {
    try {
      const res = await fetch("/api/reading");
      if (!res.ok) return;
      const data = await res.json();
      setQuota({
        guestUsed: data.guestUsed ?? 0,
        guestLimit: data.guestLimit ?? 3,
        loggedIn: !!data.loggedIn,
      });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refreshQuota();
  }, [status, session?.user?.id]);

  const resetForm = () => {
    setReading(null);
    setCached(false);
    setName("");
    setBirthdate("");
    setBirthtime("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReading(null);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          birthdate,
          birthtime: birthtime || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "เกิดข้อผิดพลาด", "error");
        setLoading(false);
        await refreshQuota();
        return;
      }
      setReading(data.reading as ReadingSections);
      setCached(!!data.cached);
      showToast(data.cached ? "ดึงผลจากแคชที่มีอยู่" : "ดูดวงสำเร็จ");
      await refreshQuota();
    } catch {
      showToast("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user || !reading) return;
    try {
      const res = await fetch("/api/user/readings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name,
          birthdate,
          birthtime: birthtime || null,
          result: reading,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "บันทึกไม่สำเร็จ", "error");
        return;
      }
      showToast(data.message ?? "บันทึกแล้ว");
    } catch {
      showToast("บันทึกไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--surface-bg)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)'
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent-secondary)' }} />
          ดูดวง
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">กรอกข้อมูลวันเกิด</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          คำทำนายแบ่งเป็นหมวด · ผู้เยี่ยมชมจำกัดครั้งต่อวัน
        </p>
        
        {/* Quota Badge */}
        {quota && !quota.loggedIn && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
            style={{ 
              backgroundColor: 'var(--surface-bg)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-muted)'
            }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ผู้เยี่ยมชม {quota.guestUsed}/{quota.guestLimit} ครั้งวันนี้
            <div className="w-20 h-1.5 rounded-full overflow-hidden ml-2"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${(quota.guestUsed / quota.guestLimit) * 100}%`,
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                }} 
              />
            </div>
          </div>
        )}
      </header>

      {/* Form Card */}
      {!reading && (
        <div className="cosmic-card p-6 md:p-10 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="field-label flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ชื่อ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="ชื่อที่เรียก"
                required
              />
            </div>

            {/* Birthdate Field */}
            <div>
              <label className="field-label flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                วันเกิด
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="field-input"
                required
              />
            </div>

            {/* Birthtime Field */}
            <div>
              <label className="field-label flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                เวลาเกิด
                <span className="text-[10px] normal-case font-normal"
                  style={{ color: 'var(--text-muted)' }}>(ไม่บังคับ)</span>
              </label>
              <input
                type="time"
                value={birthtime}
                onChange={(e) => setBirthtime(e.target.value)}
                className="field-input"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-solid w-full py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังทำนาย...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  ดูดวง
                </span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-pulse"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                opacity: 0.3
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-secondary)' }}>
            กำลังวิเคราะห์ดวงชะตา...
          </p>
        </div>
      )}

      {/* Results */}
      {reading && !loading && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Cached Badge */}
          {cached && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
                style={{ 
                  backgroundColor: 'var(--surface-bg)',
                  color: 'var(--text-muted)'
                }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ผลลัพธ์นี้มาจากแคชที่มีอยู่
              </span>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <article key={s.key} 
                className="cosmic-card surface-hover p-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-1.5"
                  style={{ backgroundColor: s.color }} 
                />
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ 
                      backgroundColor: `${s.color}20`,
                    }}>
                    {s.icon}
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}>
                    {s.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap pl-1"
                  style={{ color: 'var(--text-secondary)' }}>
                  {reading[s.key]}
                </p>
              </article>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-6">
            {session?.user && (
              <button type="button" onClick={handleSave} 
                className="btn-line py-2.5 px-5">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  บันทึกผลดวง
                </span>
              </button>
            )}
            <button type="button" onClick={resetForm} 
              className="btn-ghost py-2.5 px-5">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ดูดวงใหม่
              </span>
            </button>
            {!session?.user && (
              <Link href="/login?next=/reading" 
                className="btn-solid py-2.5 px-5">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  เข้าสู่ระบบ
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
