"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MonitoringPayload = {
  dbOk: boolean;
  uptimeSec: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  avgResponseMs: number | null;
  requestLogs: Array<{ ts: string; method: string; path: string; status: number; ms: number }>;
  errorLogs: Array<{ id: string; action: string; details: string | null; path: string | null; createdAt: string }>;
};

export default function MonitoringClient() {
  const router = useRouter();
  const [data, setData] = useState<MonitoringPayload | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/monitoring", { credentials: "same-origin" });
      if (!res.ok) {
        setErr("โหลดข้อมูลไม่สำเร็จ");
        return;
      }
      setData(await res.json());
      setErr("");
      router.refresh();
    } catch {
      setErr("เชื่อมต่อไม่สำเร็จ");
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  if (!data && !err) {
    return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>กำลังโหลด...</p>;
  }

  return (
    <div className="space-y-6">
      {err && (
        <p 
          className="text-sm rounded-lg px-4 py-2"
          style={{
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          {err}
        </p>
      )}
      {data && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="surface p-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>สถานะฐานข้อมูล</p>
              <p 
                className="font-bold" 
                style={{ color: data.dbOk ? '#34d399' : '#f87171' }}
              >
                {data.dbOk ? "เชื่อมต่อได้" : "มีปัญหา"}
              </p>
            </div>
            <div className="surface p-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Uptime (วินาที)</p>
              <p 
                className="text-xl font-semibold tabular-nums" 
                style={{ color: 'var(--text-primary)' }}
              >
                {data.uptimeSec}
              </p>
            </div>
            <div className="surface p-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Memory heap used</p>
              <p 
                className="font-mono text-sm" 
                style={{ color: 'var(--text-primary)' }}
              >
                {(data.memory.heapUsed / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <div className="surface p-4">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg response (ตัวอย่าง)</p>
              <p 
                className="font-bold" 
                style={{ color: 'var(--text-primary)' }}
              >
                {data.avgResponseMs != null ? `${data.avgResponseMs} ms` : "—"}
              </p>
            </div>
          </div>

          <div className="surface overflow-hidden">
            <h2 
              className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider"
              style={{ 
                color: 'var(--text-muted)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              Request log (ล่าสุด)
            </h2>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-xs font-mono">
                <thead 
                  className="text-xs"
                  style={{ 
                    backgroundColor: 'var(--surface-hover)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <tr>
                    <th className="text-left p-2">เวลา</th>
                    <th className="text-left p-2">method</th>
                    <th className="text-left p-2">path</th>
                    <th className="text-left p-2">status</th>
                    <th className="text-left p-2">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {data.requestLogs.map((r, i) => (
                    <tr 
                      key={`${r.ts}-${i}`} 
                      className="border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td 
                        className="p-2 whitespace-nowrap" 
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {r.ts}
                      </td>
                      <td className="p-2" style={{ color: 'var(--text-secondary)' }}>{r.method}</td>
                      <td 
                        className="p-2 truncate max-w-[200px]" 
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {r.path}
                      </td>
                      <td className="p-2">
                        <span
                          style={{
                            color: r.status < 400 ? '#34d399' : r.status < 500 ? '#fbbf24' : '#f87171'
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2" style={{ color: 'var(--text-secondary)' }}>{r.ms}</td>
                    </tr>
                  ))}
                  {data.requestLogs.length === 0 && (
                    <tr>
                      <td 
                        colSpan={5} 
                        className="p-4 text-center" 
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ยังไม่มีคำขอในหน่วยความจำ (ลองเรียก API เช่น ดูดวง / สั่งซื้อ)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface overflow-hidden">
            <h2 
              className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider"
              style={{ 
                color: 'var(--text-muted)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              Error log (20 รายการล่าสุด)
            </h2>
            <div className="max-h-64 overflow-auto text-sm">
              <table className="w-full">
                <thead 
                  className="text-xs"
                  style={{ 
                    backgroundColor: 'var(--surface-hover)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <tr>
                    <th className="text-left p-2">เวลา</th>
                    <th className="text-left p-2">path</th>
                    <th className="text-left p-2">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {data.errorLogs.map((e) => (
                    <tr 
                      key={e.id} 
                      className="border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td 
                        className="p-2 whitespace-nowrap text-xs" 
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {new Date(e.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td 
                        className="p-2 text-xs" 
                        style={{ color: '#f87171' }}
                      >
                        {e.path ?? "—"}
                      </td>
                      <td 
                        className="p-2 text-xs" 
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {e.details ?? e.action}
                      </td>
                    </tr>
                  ))}
                  {data.errorLogs.length === 0 && (
                    <tr>
                      <td 
                        colSpan={3} 
                        className="p-4 text-center" 
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ไม่มี error log
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
