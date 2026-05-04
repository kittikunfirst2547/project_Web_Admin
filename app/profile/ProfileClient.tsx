"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function ProfileClient({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ text: data.message ?? "อัปเดตข้อมูลสำเร็จ", type: "success" });
        setOldPassword("");
        setNewPassword("");
        showToast(data.message ?? "อัปเดตข้อมูลสำเร็จ");
        router.refresh();
      } else {
        setMsg({ text: data.message || "เกิดข้อผิดพลาด", type: "error" });
      }
    } catch {
      setMsg({ text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (res.ok) {
        showToast("ลบบัญชีเรียบร้อยแล้ว");
        signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        showToast(data.message || "ลบบัญชีไม่สำเร็จ", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error");
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <>
      {/* Edit Profile Card */}
      <div className="cosmic-card overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2" 
          style={{ borderColor: 'var(--border-subtle)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: 'var(--accent-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2 className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>
            แก้ไขข้อมูล
          </h2>
        </div>

        <div className="p-5">
          {/* Message */}
          {msg.text && (
            <div className={`mb-5 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
              msg.type === "success" ? "" : ""
            }`}
            style={{
              backgroundColor: msg.type === "success" ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${msg.type === "success" ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: msg.type === "success" ? '#34d399' : '#f87171'
            }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {msg.type === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
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
              />
            </div>

            {/* Password Section */}
            <div className="pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                เปลี่ยนรหัสผ่าน
                <span className="text-[10px] normal-case font-normal"
                  style={{ color: 'var(--text-muted)' }}>(ไม่บังคับ)</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="field-label">รหัสเดิม</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="field-input"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="field-label">รหัสใหม่</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="field-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-solid disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังบันทึก…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Actions Card */}
      <div className="cosmic-card overflow-hidden" 
        style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
        <div className="p-5 border-b flex items-center gap-2" 
          style={{ borderColor: 'rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">
            บัญชี
          </h2>
        </div>

        <div className="p-5">
          <p className="mb-5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            จัดการบัญชีของคุณ การลบบัญชีจะทำให้ไม่สามารถกู้คืนข้อมูลได้
          </p>

          <div className="flex flex-wrap gap-2">
            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-line py-2 px-4 text-xs flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>

            {/* Delete Account */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg px-4 py-2 text-xs flex items-center gap-2 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171'
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบบัญชี
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>ยืนยันการลบ?</span>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  ลบ
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-2 py-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
