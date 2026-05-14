"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BackupRow = { filename: string; sizeKB: number; date: string };

export default function BackupActions({ backups }: { backups: BackupRow[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const runBackup = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message ?? "สำรองไม่สำเร็จ");
        return;
      }
      setMsg(`✅ ${data.message} — ${data.filename} (${data.sizeKB} KB)`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const restore = async (filename: string) => {
    if (!confirm(`กู้คืนจาก ${filename} — ข้อมูลปัจจุบันจะถูกแทนที่`)) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ filename, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`❌ ${data.message ?? "กู้คืนไม่สำเร็จ"}`);
        return;
      }
      setMsg(`✅ ${data.message ?? "กู้คืนสำเร็จ"}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (filename: string) => {
    window.open(`/api/admin/export?filename=${encodeURIComponent(filename)}`, "_blank");
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm(`ลบไฟล์ ${filename}?`)) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/backup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`❌ ${data.message ?? "ลบไม่สำเร็จ"}`);
        return;
      }
      setMsg(`✅ ${data.message}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    window.open("/api/admin/export?type=users", "_blank");
  };

  const exportReadings = async () => {
    window.open("/api/admin/export?type=readings", "_blank");
  };

  return (
    <>
      {msg && (
        <p
          className="rounded-lg px-4 py-3 text-xs"
          style={{
            backgroundColor: msg.startsWith("✅")
              ? 'rgba(52, 211, 153, 0.1)'
              : msg.startsWith("❌")
              ? 'rgba(239, 68, 68, 0.1)'
              : 'var(--surface-bg)',
            border: `1px solid ${
              msg.startsWith("✅")
                ? 'rgba(52, 211, 153, 0.3)'
                : msg.startsWith("❌")
                ? 'rgba(239, 68, 68, 0.3)'
                : 'var(--surface-border)'
            }`,
            color: msg.startsWith("✅")
              ? '#34d399'
              : msg.startsWith("❌")
              ? '#f87171'
              : 'var(--text-muted)',
          }}
        >
          {msg}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={runBackup}
          className="btn-solid disabled:opacity-50"
        >
          {loading ? "กำลังดำเนินการ..." : "🔒 สำรองข้อมูลตอนนี้"}
        </button>
        <button
          type="button"
          onClick={exportUsers}
          className="btn-line py-2 text-xs"
        >
          📤 Export Users JSON
        </button>
        <button
          type="button"
          onClick={exportReadings}
          className="btn-line py-2 text-xs"
        >
          📤 Export Readings JSON
        </button>
      </div>

      <div className="surface overflow-hidden">
        <h3
          className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider"
          style={{
            color: 'var(--text-muted)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          ไฟล์สำรอง ({backups.length} ไฟล์)
        </h3>
        <table className="w-full text-sm">
          <thead
            className="border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ไฟล์</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ขนาด</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>วันที่</th>
              <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr
                key={b.filename}
                className="border-b transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td
                  className="p-3 font-mono text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#34d399' }}
                    />
                    {b.filename}
                  </div>
                </td>
                <td className="p-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {b.sizeKB.toLocaleString()} KB
                </td>
                <td
                  className="p-3 text-xs whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {new Date(b.date).toLocaleString("th-TH")}
                </td>
                <td className="p-3">
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
                      style={{
                        backgroundColor: 'rgba(96, 165, 250, 0.15)',
                        color: '#60a5fa',
                      }}
                      onClick={() => downloadBackup(b.filename)}
                      title="ดาวน์โหลด"
                    >
                      ⬇ Download
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        color: '#fbbf24',
                      }}
                      onClick={() => restore(b.filename)}
                      title="กู้คืนข้อมูล"
                    >
                      ↻ Restore
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                      }}
                      onClick={() => deleteBackup(b.filename)}
                      title="ลบไฟล์"
                    >
                      ✕ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ยังไม่มีไฟล์สำรอง — กดปุ่ม &quot;สำรองข้อมูลตอนนี้&quot; ด้านบน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
