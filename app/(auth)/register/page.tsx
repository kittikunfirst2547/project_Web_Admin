"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { label: "", bar: null as string | null, color: "" };
    if (pw.length < 6)
      return { label: "อ่อน", bar: "w-1/3", color: "#ef4444" };
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    if (hasLetter && hasNumber && hasSpecial && pw.length >= 8) {
      return { label: "แข็งแรง", bar: "w-full", color: "#34d399" };
    }
    return { label: "ปานกลาง", bar: "w-2/3", color: "#fbbf24" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด");
        setLoading(false);
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="cosmic-card w-full max-w-md p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}>
            ✦
          </div>
          <p className="text-xs uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>บัญชี</p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            สมัครสมาชิก
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg px-4 py-3 text-center text-sm flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171'
            }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="field-label flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="field-label flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
              required
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-[10px]"
                  style={{ color: 'var(--text-muted)' }}>
                  <span>ความแข็งแรง</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {strength.bar && (
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}
                      style={{ backgroundColor: strength.color }}
                    />
                  )}
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวอักษร ตัวเลข และสัญลักษณ์พิเศษ
                </p>
              </div>
            )}
          </div>

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
                กำลังสมัคร…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                สมัครสมาชิก
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-medium transition-colors hover:underline"
            style={{ color: 'var(--accent-primary)' }}>
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
