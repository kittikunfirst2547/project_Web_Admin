"use client";

import { useEffect, useState } from "react";

type Schedule = {
  id: string;
  name: string;
  time: string;
  days: string[];
  isActive: boolean;
  keepCount: number;
  createdAt: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
};

const DAY_LABELS: Record<string, string> = {
  mon: "จ",
  tue: "อ",
  wed: "พ",
  thu: "พฤ",
  fri: "ศ",
  sat: "ส",
  sun: "อา",
};

const DAY_OPTIONS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function ScheduledBackupPanel() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [time, setTime] = useState("02:00");
  const [days, setDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [keepCount, setKeepCount] = useState(10);
  const [isActive, setIsActive] = useState(true);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/admin/scheduled-backup", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules ?? []);
      }
    } catch {
      console.error("Failed to fetch schedules");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const resetForm = () => {
    setName("");
    setTime("02:00");
    setDays(["mon", "tue", "wed", "thu", "fri"]);
    setKeepCount(10);
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (schedule: Schedule) => {
    setName(schedule.name);
    setTime(schedule.time);
    setDays(schedule.days);
    setKeepCount(schedule.keepCount);
    setIsActive(schedule.isActive);
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const url = "/api/admin/scheduled-backup";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, name, time, days, keepCount, isActive }
        : { name, time, days, keepCount, isActive };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "ไม่สำเร็จ");
        return;
      }

      setMsg(editingId ? "อัปเดตสำเร็จ" : "สร้างสำเร็จ");
      resetForm();
      await fetchSchedules();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ schedule นี้?")) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/scheduled-backup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMsg("ลบสำเร็จ");
        await fetchSchedules();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const triggerScheduler = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scheduler", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      setMsg(data.message || "รัน scheduler แล้ว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          ตั้งเวลาสำรองข้อมูลอัตโนมัติ
        </h2>
        <div className="flex gap-2">
          <button
            onClick={triggerScheduler}
            disabled={loading}
            className="btn-line py-2 text-xs"
          >
            รันทดสอบ Scheduler
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
            className="btn-solid py-2 text-xs"
          >
            {showForm ? "ยกเลิก" : "+ เพิ่ม Schedule"}
          </button>
        </div>
      </div>

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

      {showForm && (
        <form onSubmit={handleSubmit} className="cosmic-card p-6 space-y-4">
          <div>
            <label className="field-label">ชื่อ Schedule</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input w-full"
              placeholder="เช่น Daily Backup"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">เวลา (HH:mm)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="field-input w-full"
                required
              />
            </div>
            <div>
              <label className="field-label">เก็บ backup สูงสุด (จำนวน)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={keepCount}
                onChange={(e) => setKeepCount(Number(e.target.value))}
                className="field-input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label mb-2">วันที่ทำ backup</label>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: days.includes(day) ? 'rgba(124, 58, 237, 0.2)' : 'var(--surface-hover)',
                    color: days.includes(day) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor: days.includes(day) ? 'rgba(124, 58, 237, 0.3)' : 'var(--border-default)'
                  }}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{
                borderColor: 'var(--border-default)',
                accentColor: 'var(--accent-primary)'
              }}
            />
            <label 
              htmlFor="isActive" 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              เปิดใช้งาน
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || days.length === 0}
              className="btn-solid disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : editingId ? "อัปเดต" : "สร้าง"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-line"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead 
            className="border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ชื่อ</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>เวลา</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>วัน</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>สถานะ</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>รันครั้งล่าสุด</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr 
                key={s.id} 
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className="p-3">
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    เก็บ {s.keepCount} รายการ
                  </div>
                </td>
                <td className="p-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{s.time}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {s.days.map((d) => (
                      <span
                        key={d}
                        className="inline-block px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--surface-hover)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {DAY_LABELS[d]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: s.isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(161, 161, 170, 0.2)',
                      color: s.isActive ? '#34d399' : 'var(--text-muted)'
                    }}
                  >
                    {s.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="p-3 text-xs">
                  {s.lastRunAt ? (
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {new Date(s.lastRunAt).toLocaleString("th-TH")}
                      </div>
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                        style={{
                          color: s.lastRunStatus === "success" ? '#34d399' : '#f87171'
                        }}
                      >
                        {s.lastRunStatus === "success" ? "✓ สำเร็จ" : "✗ ล้มเหลว"}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>ยังไม่เคยรัน</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(s)}
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={loading}
                      className="text-xs px-3 py-1 rounded-lg disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171'
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td 
                  colSpan={6} 
                  className="p-6 text-center" 
                  style={{ color: 'var(--text-muted)' }}
                >
                  ยังไม่มี schedule — กด "+ เพิ่ม Schedule" เพื่อสร้าง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
