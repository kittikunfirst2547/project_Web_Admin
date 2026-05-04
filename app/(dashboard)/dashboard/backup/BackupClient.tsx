"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScheduledBackupPanel from "./ScheduledBackupPanel";

type BackupRow = { filename: string; sizeKB: number; date: string };

export default function BackupClient() {
  const router = useRouter();
  const [list, setList] = useState<BackupRow[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/backup", {
      credentials: "same-origin",
    });
    if (res.ok) {
      const data = await res.json();
      setList(data.backups ?? []);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

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
      setMsg(data.message ?? "สำเร็จ");
      await refresh();
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
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message ?? "กู้คืนไม่สำเร็จ");
        return;
      }
      setMsg(data.message ?? "กู้คืนสำเร็จ");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    const res = await fetch("/api/admin/export?type=users", {
      credentials: "same-origin",
    });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users-export.json";
    a.click();
  };

  const exportReadings = async () => {
    const res = await fetch("/api/admin/export?type=readings", {
      credentials: "same-origin",
    });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "readings-export.json";
    a.click();
  };

  return (
    <div className="space-y-8">
      <ScheduledBackupPanel />

      <div 
        className="border-t pt-6" 
        style={{ borderColor: 'var(--border-subtle)' }} 
      />

      {msg && (
        <p 
          className="rounded-md px-4 py-2 text-xs"
          style={{
            backgroundColor: 'var(--surface-bg)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-muted)'
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
          {loading ? "กำลังดำเนินการ..." : "สำรองข้อมูลตอนนี้"}
        </button>
        <button
          type="button"
          onClick={exportUsers}
          className="btn-line py-2 text-xs"
        >
          Export Users JSON
        </button>
        <button
          type="button"
          onClick={exportReadings}
          className="btn-line py-2 text-xs"
        >
          Export Readings JSON
        </button>
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead 
            className="border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ไฟล์</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ขนาด</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>สถานะ</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>วันที่</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr 
                key={b.filename} 
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td 
                  className="p-3 font-mono text-xs" 
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {b.filename}
                </td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{b.sizeKB.toLocaleString()} KB</td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>✓</td>
                <td 
                  className="p-3 text-xs whitespace-nowrap" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  {new Date(b.date).toLocaleString("th-TH")}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    disabled={loading}
                    className="text-xs px-3 py-1 rounded-lg disabled:opacity-50"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171'
                    }}
                    onClick={() => restore(b.filename)}
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td 
                  colSpan={5} 
                  className="p-6 text-center" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  ยังไม่มีไฟล์สำรอง — กดปุ่มสำรองด้านบน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
