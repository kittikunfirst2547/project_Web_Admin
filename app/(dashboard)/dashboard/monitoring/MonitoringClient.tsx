"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type MonitoringPayload = {
  dbOk: boolean;
  uptimeSec: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  avgResponseMs: number | null;
  requestLogs: Array<{ ts: string; method: string; path: string; status: number; ms: number }>;
  errorLogs: Array<{ id: string; action: string; details: string | null; path: string | null; createdAt: string }>;
  accessLogs: Array<{
    id: string;
    userId: string | null;
    userName: string | null;
    path: string | null;
    method: string;
    details: string | null;
    createdAt: string;
  }>;
  accessTotal: number;
  accessPage: number;
  accessLimit: number;
};

type TabKey = "request" | "access" | "error";

export default function MonitoringClient() {
  const router = useRouter();
  const [data, setData] = useState<MonitoringPayload | null>(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("access");

  // Access log state
  const [accessPage, setAccessPage] = useState(1);
  const [accessFilter, setAccessFilter] = useState("");
  const [filterInput, setFilterInput] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        accessPage: String(accessPage),
        accessLimit: "20",
      });
      if (accessFilter) params.set("accessFilter", accessFilter);

      const res = await fetch(`/api/admin/monitoring?${params}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        setErr("โหลดข้อมูลไม่สำเร็จ");
        return;
      }
      setData(await res.json());
      setErr("");
    } catch {
      setErr("เชื่อมต่อไม่สำเร็จ");
    }
  }, [accessPage, accessFilter]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const handleSearch = () => {
    setAccessPage(1);
    setAccessFilter(filterInput);
  };

  const handleClearFilter = () => {
    setFilterInput("");
    setAccessPage(1);
    setAccessFilter("");
  };

  if (!data && !err) {
    return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>กำลังโหลด...</p>;
  }

  const accessTotalPages = data ? Math.ceil(data.accessTotal / data.accessLimit) : 0;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "access", label: "Access Log", count: data?.accessTotal },
    { key: "request", label: "Request Log", count: data?.requestLogs.length },
    { key: "error", label: "Error Log", count: data?.errorLogs.length },
  ];

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
          {/* ─── Stat Cards ─── */}
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
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Uptime</p>
              <p
                className="text-xl font-semibold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatUptime(data.uptimeSec)}
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
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg response</p>
              <p
                className="font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {data.avgResponseMs != null ? `${data.avgResponseMs} ms` : "—"}
              </p>
            </div>
          </div>

          {/* ─── Tab Bar ─── */}
          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ backgroundColor: 'var(--surface-hover)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200"
                style={
                  activeTab === tab.key
                    ? {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }
                    : {
                        color: 'var(--text-muted)',
                      }
                }
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      backgroundColor: activeTab === tab.key
                        ? 'rgba(124, 58, 237, 0.15)'
                        : 'rgba(161, 161, 170, 0.15)',
                      color: activeTab === tab.key
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─── Access Log Tab ─── */}
          {activeTab === "access" && (
            <div className="surface overflow-hidden">
              <div
                className="flex flex-wrap items-center gap-3 border-b px-4 py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h2
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Access Log ({data.accessTotal} รายการ)
                </h2>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filterInput}
                    onChange={(e) => setFilterInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="ค้นหา path..."
                    className="field-input py-1.5 px-3 text-xs w-48"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: 'rgba(124, 58, 237, 0.2)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    ค้นหา
                  </button>
                  {accessFilter && (
                    <button
                      onClick={handleClearFilter}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[450px] overflow-auto">
                <table className="w-full text-xs">
                  <thead
                    className="text-xs sticky top-0 z-10"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <tr>
                      <th className="text-left p-2.5">เวลา</th>
                      <th className="text-left p-2.5">ผู้ใช้</th>
                      <th className="text-left p-2.5">method</th>
                      <th className="text-left p-2.5">path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.accessLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t transition-colors"
                        style={{ borderColor: 'var(--border-subtle)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td
                          className="p-2.5 whitespace-nowrap font-mono"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {new Date(log.createdAt).toLocaleString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="p-2.5" style={{ color: 'var(--text-secondary)' }}>
                          {log.userName ? (
                            <span className="inline-flex items-center gap-1">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                                style={{
                                  backgroundColor: 'rgba(124, 58, 237, 0.15)',
                                  color: 'var(--accent-primary)',
                                }}
                              >
                                {log.userName.charAt(0).toUpperCase()}
                              </span>
                              {log.userName}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>ไม่ระบุ</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor:
                                log.method === "GET"
                                  ? 'rgba(52, 211, 153, 0.15)'
                                  : log.method === "POST"
                                  ? 'rgba(96, 165, 250, 0.15)'
                                  : 'rgba(251, 191, 36, 0.15)',
                              color:
                                log.method === "GET"
                                  ? '#34d399'
                                  : log.method === "POST"
                                  ? '#60a5fa'
                                  : '#fbbf24',
                            }}
                          >
                            {log.method}
                          </span>
                        </td>
                        <td
                          className="p-2.5 font-mono truncate max-w-[300px]"
                          title={log.path || ""}
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {log.path || "—"}
                        </td>
                      </tr>
                    ))}
                    {data.accessLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {accessFilter
                            ? `ไม่พบ access log ที่ตรงกับ "${accessFilter}"`
                            : "ยังไม่มี access log — ลองเข้าถึงหน้าต่างๆ ในระบบ"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {accessTotalPages > 1 && (
                <div
                  className="flex items-center justify-between border-t px-4 py-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    หน้า {data.accessPage} จาก {accessTotalPages} ({data.accessTotal} รายการ)
                  </p>
                  <div className="flex gap-1">
                    <button
                      disabled={accessPage <= 1}
                      onClick={() => setAccessPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-md text-xs disabled:opacity-30 transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      ← ก่อนหน้า
                    </button>
                    <button
                      disabled={accessPage >= accessTotalPages}
                      onClick={() => setAccessPage((p) => p + 1)}
                      className="px-3 py-1 rounded-md text-xs disabled:opacity-30 transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Request Log Tab ─── */}
          {activeTab === "request" && (
            <div className="surface overflow-hidden">
              <h2
                className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                Request log (in-memory — ล่าสุด)
              </h2>
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-xs font-mono">
                  <thead
                    className="text-xs sticky top-0 z-10"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      color: 'var(--text-muted)',
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
                        <td className="p-2" style={{ color: 'var(--text-secondary)' }}>
                          {r.method}
                        </td>
                        <td
                          className="p-2 truncate max-w-[200px]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {r.path}
                        </td>
                        <td className="p-2">
                          <span
                            style={{
                              color:
                                r.status < 400
                                  ? '#34d399'
                                  : r.status < 500
                                  ? '#fbbf24'
                                  : '#f87171',
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-2" style={{ color: 'var(--text-secondary)' }}>
                          {r.ms}
                        </td>
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
          )}

          {/* ─── Error Log Tab ─── */}
          {activeTab === "error" && (
            <div className="surface overflow-hidden">
              <h2
                className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                Error log (20 รายการล่าสุด)
              </h2>
              <div className="max-h-64 overflow-auto text-sm">
                <table className="w-full">
                  <thead
                    className="text-xs sticky top-0 z-10"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      color: 'var(--text-muted)',
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
          )}
        </>
      )}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}
