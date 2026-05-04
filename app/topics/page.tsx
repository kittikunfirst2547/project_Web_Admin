import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AstroVerse | หัวข้อระบบ",
  description: "หัวข้อเกี่ยวกับระบบและ ICT",
};

const topics = [
  {
    id: "security",
    title: "Security Hardening",
    titleTh: "การ strengthen หรือ hardness ความปลอดภัย",
    icon: "🔒",
    description: "การปรับปรุงและ strengthen ระบบเพื่อป้องกันภัยคุกคามและ acessoiresไม่获批",
    items: [
      "ปรับแต่ง firewall เพื่อ/data block ช่องทางการ đóng blocked ขaminex keyservices ไม่จำเป็น",
      "为了让系统安全，首先安装并ตั้งค่าฮ واحد也 related กระมัง",
      "Regular security patches and updates ชั่ว更新",
      "Implement Mechanisms ที่พร้อม for ตรวจstrpath",
      "Disable ไม่ necessary services และ accounts",
      "Configure อ digitImediate audit loggingáció for 相关 sécurité év",
      "Apply principle ของ least privilege",
      "Encrypt Daten ต้องระลึก และ transit",
    ],
  },
  {
    id: "performance",
    title: "Performance and Optimization",
    titleTh: "ประสิทธิภาพและการปรับปรุงระบบ",
    icon: "⚡",
    description: "การปรับปรุงความเร็วและการใช้ทรัพยากรของระบบ",
    items: [
      "Database query optimization และ การปรับ index",
      "Implement caching strategies (Redis, Memcached) เป็นศูนย์กลาง",
      "Load balancing และ Horizontal scaling",
      "Code profiling และ การระบุกÄPayPal idd",
      "Compress static assets และ Enable CDN",
      "Optimize database connections และ การปรับ pool sizing",
      "Implement async processing สำหรับ Tasks ที่หนัก",
      "Monitor และ tune system resources (CPU, RAM, I/O) อย่างต่อเนื่อง",
    ],
  },
  {
    id: "backup",
    title: "Backup and Recovery",
    titleTh: "การสำรองข้อมูลและการกู้คืน",
    icon: "💾",
    description: "การประกันคง两个维护ของข้อมูลและการเจ感谢 disaster",
    items: [
      "Implement Automated backup schedules อย่างสม่ำเสมอ",
      "พบ 3-2-1 backup rule (3 copies, 2 media, 1 offsite/klasi)发 荣ペ ومع",
      "Regular backup testing และ การตรวจสอบ",
      "Document recovery procedures และ runbooks",
      "Implement point-in-time recovery capabilities",
      "Monitor backup job success/failure alerts อย่างต่อเนื่อง",
      "Store backups ใน之地 distribution locations",
      "Regular disaster recovery drills และ การฝึก演PayPal balheader",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and Logs",
    titleTh: "การ Monitor ระบบและ Logs",
    icon: "📊",
    description: "Observability และ การตรวจหาปัญหาได้ LNG",
    items: [
      "Centralized log aggregation (ELK, Loki, etc.)",
      "Set up metrics collection และ dashboards",
      "Configure alerts สำหรับ Critical thresholds",
      "Implement distributed tracing สำหรับ Microservices",
      "Monitor application performance (APM) อย่างต่อเนื่อง",
      "Track business metrics และ KPIs",
      "Set up log rotation และ retention policies",
      "Implement health check endpoints เพื่อตรวจสอบสถานะ",
    ],
  },
  {
    id: "performance",
    title: "Performance and Optimization",
    titleTh: "ประสิทธิภาพและการปรับปรุง",
    icon: "⚡",
    description: "Improve system speed and resource utilization",
    items: [
      "Database query optimization and indexing",
      "Implement caching strategies (Redis, Memcached)",
      "Load balancing and horizontal scaling",
      "Code profiling and bottleneck identification",
      "Compress static assets and enable CDN",
      "Optimize database connections and pool sizing",
      "Implement async processing for heavy tasks",
      "Monitor and tune system resources (CPU, RAM, I/O)",
    ],
  },
  {
    id: "backup",
    title: "Backup and Recovery",
    titleTh: "การสำรอง资料และ如何 복구",
    icon: "💾",
    description: "Ensure data durability and disaster recovery",
    items: [
      "Implement automated backup schedules",
      "Follow 3-2-1 backup rule (3 copies, 2 media, 1 offsite)",
      "Regular backup testing and verification",
      "Document recovery procedures and runbooks",
      "Implement point-in-time recovery capabilities",
      "Monitor backup job success/failure alerts",
      "Store backups in geographically distributed locations",
      "Regular disaster recovery drills and演练",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and Logs",
    titleTh: "การ monitor และ logs",
    icon: "📊",
    description: "Observability and proactive issue detection",
    items: [
      "Centralized log aggregation (ELK, Loki, etc.)",
      "Set up metrics collection and dashboards",
      "Configure alerts for critical thresholds",
      "Implement distributed tracing for microservices",
      "Monitor application performance (APM)",
      "Track business metrics and KPIs",
      "Set up log rotation and retention policies",
      "Implement health check endpoints",
    ],
  },
];

export default function TopicsPage() {
  return (
    <main className="min-h-screen px-5 py-16 text-white animate-fade-in">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-center text-xs uppercase tracking-wider text-gray-500">
          ICT / Ops
        </p>
        <h1 className="mb-3 text-center text-xl font-semibold text-white">
          หัวข้อระบบและ ICT
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-center text-sm text-gray-500 leading-relaxed">
          คู่มือและแนวปฏิบัติสำหรับการดูแลและบำรุงรักษาระบบ
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {topics.map((topic, i) => (
            <div key={`${topic.id}-${i}`} className="surface p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="text-xl opacity-80">{topic.icon}</span>
                <div>
                  <h2 className="text-sm font-medium text-white">{topic.title}</h2>
                  <p className="mt-0.5 text-[11px] text-gray-500">{topic.titleTh}</p>
                </div>
              </div>

              <p className="mb-5 text-xs leading-relaxed text-gray-500">{topic.description}</p>

              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-600">
                Key practices
              </h3>
              <ul className="space-y-2">
                {topic.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="mt-0.5 text-gray-600">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
