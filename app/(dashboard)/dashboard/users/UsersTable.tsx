"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  readings: number;
  createdAt: string;
};

export default function UsersTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        (u.name && u.name.toLowerCase().includes(s))
    );
  }, [users, q]);

  const patchUser = async (id: string, body: object) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setBanner(d.message ?? "ไม่สำเร็จ");
        return;
      }
      setBanner("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("ยืนยันการลบผู้ใช้รายนี้?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) {
        const d = await res.json();
        setBanner(d.message ?? "ไม่สำเร็จ");
        return;
      }
      setBanner("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const exportJson = async () => {
    const res = await fetch("/api/admin/export?type=users", { credentials: "same-origin" });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.json";
    a.click();
  };

  return (
    <div className="space-y-4">
      {banner && (
        <p 
          className="text-sm rounded-lg px-4 py-2"
          style={{ 
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          {banner}
        </p>
      )}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input
          type="search"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg px-4 py-2 text-sm"
          style={{
            backgroundColor: 'var(--surface-bg)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)'
          }}
        />
        <button
          type="button"
          onClick={exportJson}
          className="btn-solid py-2 text-xs"
        >
          Export JSON
        </button>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[900px]">
          <thead>
            <tr 
              className="border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>ผู้ใช้</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>อีเมล</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>บทบาท</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>สถานะ</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>ดูดวง</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>สมัคร</th>
              <th className="p-3" style={{ color: 'var(--text-secondary)' }}>การทำงาน</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr 
                key={u.id} 
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium"
                      style={{ 
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {(u.name || u.email).charAt(0).toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{u.name || "—"}</span>
                  </div>
                </td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td className="p-3">
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  {u.isBanned ? (
                    <span className="text-xs" style={{ color: '#f87171' }}>ระงับ</span>
                  ) : (
                    <span className="text-xs" style={{ color: '#34d399' }}>ปกติ</span>
                  )}
                </td>
                <td 
                  className="p-3 font-mono text-xs" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  {u.readings}
                </td>
                <td 
                  className="p-3 whitespace-nowrap" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  {new Date(u.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="p-3 space-x-1 whitespace-nowrap">
                  <button
                    type="button"
                    disabled={busy === u.id}
                    className="text-xs px-2 py-1 rounded disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                    onClick={() => patchUser(u.id, { isBanned: !u.isBanned })}
                  >
                    {u.isBanned ? "ปลดแบน" : "แบน"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === u.id}
                    className="text-xs px-2 py-1 rounded disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                    onClick={() =>
                      patchUser(u.id, { role: u.role === "admin" ? "user" : "admin" })
                    }
                  >
                    สลับ role
                  </button>
                  <button
                    type="button"
                    disabled={busy === u.id}
                    className="text-xs px-2 py-1 rounded disabled:opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171'
                    }}
                    onClick={() => deleteUser(u.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
