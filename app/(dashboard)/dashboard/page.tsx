import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แดชบอร์ดผู้ดูแลระบบ | Mahoraga",
  description: "สถิติและคำสั่งซื้อล่าสุด",
};

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // รวม queries ที่ไม่ขึ้นกันด้วย Promise.all
  const [totalUsers, totalReadings, ordersToday, errorsToday, recentOrders, readingsToday] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.reading.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.log.count({ where: { level: "error", createdAt: { gte: today } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    }),
    prisma.reading.findMany({
      where: { createdAt: { gte: today }, userId: { not: null } },
      select: { userId: true },
    }),
  ]);

  // Top readers calculation (ใน memory)
  const counts = new Map<string, number>();
  for (const r of readingsToday) {
    if (!r.userId) continue;
    counts.set(r.userId, (counts.get(r.userId) ?? 0) + 1);
  }
  const topReadersToday = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({ userId, count }));

  const userIds = topReadersToday.map((t) => t.userId);
  const usersMap = Object.fromEntries(
    (
      await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    ).map((u) => [u.id, u])
  );

  // Optimize chart data: ใช้ query เดียวแทน 7 queries
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const startDate = last7Days[0];
  const endDate = new Date(last7Days[6]);
  endDate.setDate(endDate.getDate() + 1);

  const readingsLast7Days = await prisma.reading.findMany({
    where: { createdAt: { gte: startDate, lt: endDate } },
    select: { createdAt: true },
  });

  // Group by day in memory (เร็วกว่า query 7 ครั้ง)
  const chartData = last7Days.map((date, i) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const count = readingsLast7Days.filter(
      (r) => r.createdAt >= date && r.createdAt < nextDate
    ).length;
    return {
      label:
        i === 6 ? "วันนี้" : date.toLocaleDateString("th-TH", { weekday: "short" }),
      count,
    };
  });

  const maxReading = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p 
          className="text-xs uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          แดชบอร์ด
        </p>
        <h1 
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          ภาพรวมระบบ
        </h1>
        <p 
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          สถิติหลักของ Mahoraga
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "ผู้ใช้ทั้งหมด", value: totalUsers },
          { label: "การดูดวงทั้งหมด", value: totalReadings },
          { label: "ออเดอร์วันนี้", value: ordersToday },
          { label: "Errors วันนี้", value: errorsToday },
        ].map((c) => (
          <div
            key={c.label}
            className="surface p-5"
          >
            <p 
              className="text-[11px] uppercase tracking-wide mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {c.label}
            </p>
            <p 
              className="text-2xl font-semibold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 surface p-6">
          <h2 
            className="text-xs font-medium uppercase tracking-wider mb-6 pb-3 border-b"
            style={{ 
              color: 'var(--text-muted)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            สถิติการดูดวง 7 วันล่าสุด
          </h2>
          <div className="h-56 flex items-end justify-between gap-2 pt-3">
            {chartData.map((data, i) => {
              const h = Math.max((data.count / maxReading) * 100, 6);
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative flex justify-center h-44 items-end">
                    <div
                      className="w-full max-w-[36px] rounded-t-sm transition-all"
                      style={{ 
                        height: `${h}%`,
                        backgroundColor: 'var(--accent-primary)',
                        opacity: 0.4
                      }}
                    />
                    <div 
                      className="absolute -top-6 rounded px-2 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ 
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {data.count}
                    </div>
                  </div>
                  <span 
                    className="text-[10px] mt-2 text-center leading-tight"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface p-6">
          <h2 
            className="text-xs font-medium uppercase tracking-wider mb-4 pb-3 border-b"
            style={{ 
              color: 'var(--text-muted)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            AI usage วันนี้ (Top 5)
          </h2>
          <ul className="space-y-3">
            {topReadersToday.map((row, idx) => {
              const u = usersMap[row.userId];
              return (
                <li
                  key={row.userId ?? idx}
                  className="flex justify-between text-sm pb-2"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span 
                    className="truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {idx + 1}. {u?.name || u?.email || row.userId}
                  </span>
                  <span 
                    className="font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {row.count}
                  </span>
                </li>
              );
            })}
            {topReadersToday.length === 0 && (
              <li 
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ยังไม่มีข้อมูลวันนี้
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="surface p-6 overflow-x-auto">
        <h2 
          className="text-xs font-medium uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          คำสั่งซื้อล่าสุด
        </h2>
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr 
              className="border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <th 
                className="pb-3 pr-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                ผู้ใช้
              </th>
              <th 
                className="pb-3 pr-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                สินค้า
              </th>
              <th 
                className="pb-3 pr-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                ราคา
              </th>
              <th 
                className="pb-3 pr-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                สถานะ
              </th>
              <th 
                className="pb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                วันที่
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr 
                key={o.id} 
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td 
                  className="py-3 pr-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {o.user.name || o.user.email}
                </td>
                <td 
                  className="py-3 pr-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {o.product.name}
                </td>
                <td 
                  className="py-3 pr-4 tabular-nums"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ฿{o.amount.toLocaleString()}
                </td>
                <td className="py-3 pr-4">
                  <span 
                    className="rounded-md border px-2 py-0.5 text-[11px]"
                    style={{ 
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {o.status}
                  </span>
                </td>
                <td 
                  className="py-3 whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {new Date(o.createdAt).toLocaleString("th-TH")}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td 
                  colSpan={5} 
                  className="py-8 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ยังไม่มีคำสั่งซื้อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
