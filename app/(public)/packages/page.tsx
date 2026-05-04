import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "แพ็คเกจดูดวง | Mahoraga",
  description: "เลือกแพ็คเกจดูดวงที่เหมาะกับคุณ - Free, Plus, Pro",
};

const packages = [
  {
    id: "free",
    name: "Free",
    nameTh: "ฟรี",
    price: "฿0",
    priceNote: "ต่อเดือน",
    icon: "🌟",
    color: "#94a3b8",
    gradient: "linear-gradient(135deg, #64748b, #94a3b8)",
    features: [
      { text: "ดูดวง AI 3 ครั้ง/เดือน", included: true },
      { text: "พยากรณ์พื้นฐาน 6 หมวด", included: true },
      { text: "บันทึกประวัติ 10 รายการ", included: true },
      { text: "ดูดวงแบบละเอียด", included: false },
      { text: "คำปรึกษาส่วนตัว", included: false },
      { text: "รายงาน PDF", included: false },
    ],
    cta: "เริ่มใช้ฟรี",
    href: "/reading",
    popular: false,
  },
  {
    id: "plus",
    name: "Plus",
    nameTh: "พลัส",
    price: "฿199",
    priceNote: "ต่อเดือน",
    icon: "✨",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    features: [
      { text: "ดูดวง AI ไม่จำกัด", included: true },
      { text: "พยากรณ์พื้นฐาน 6 หมวด", included: true },
      { text: "บันทึกประวัติไม่จำกัด", included: true },
      { text: "ดูดวงแบบละเอียด", included: true },
      { text: "คำปรึกษาส่วนตัว 1 ครั้ง/เดือน", included: true },
      { text: "รายงาน PDF", included: false },
    ],
    cta: "สมัคร Plus",
    href: "/register?plan=plus",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    nameTh: "โปร",
    price: "฿499",
    priceNote: "ต่อเดือน",
    icon: "👑",
    color: "#fbbf24",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    features: [
      { text: "ดูดวง AI ไม่จำกัด", included: true },
      { text: "พยากรณ์พื้นฐาน 6 หมวด", included: true },
      { text: "บันทึกประวัติไม่จำกัด", included: true },
      { text: "ดูดวงแบบละเอียด", included: true },
      { text: "คำปรึกษาส่วนตัวไม่จำกัด", included: true },
      { text: "รายงาน PDF + วิดีโอ", included: true },
    ],
    cta: "สมัคร Pro",
    href: "/register?plan=pro",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "จำนวนครั้งดูดวง/เดือน", free: "3 ครั้ง", plus: "ไม่จำกัด", pro: "ไม่จำกัด" },
  { name: "พยากรณ์พื้นฐาน", free: "✓", plus: "✓", pro: "✓" },
  { name: "ดูดวงละเอียด", free: "—", plus: "✓", pro: "✓" },
  { name: "บันทึกประวัติ", free: "10 รายการ", plus: "ไม่จำกัด", pro: "ไม่จำกัด" },
  { name: "คำปรึกษาส่วนตัว", free: "—", plus: "1 ครั้ง/เดือน", pro: "ไม่จำกัด" },
  { name: "รายงาน PDF", free: "—", plus: "—", pro: "✓ + วิดีโอ" },
  { name: "สนับสนุน", free: "Community", plus: "Priority", pro: "VIP 24/7" },
];

export default function PackagesPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8">
        <div className="absolute inset-0 cosmic-bg opacity-30" />
        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-medium"
              style={{ 
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-secondary)'
              }}>
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-secondary)' }} />
              แพ็คเกจดูดวง
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text">เลือกแพ็คเกจที่ใช่สำหรับคุณ</span>
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              ดูดวง AI แม่นยำ พร้อมคำแนะนำเฉพาะบุคคล เริ่มต้นฟรี หรืออัปเกรดเพื่อประสบการณ์ที่ลึกซึ้งกว่า
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="cosmic-card relative flex flex-col overflow-hidden"
                style={{
                  borderColor: pkg.popular ? pkg.color : undefined,
                  borderWidth: pkg.popular ? '2px' : undefined,
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute top-0 right-0 left-0 text-center py-2 text-xs font-medium text-white"
                    style={{ background: pkg.gradient }}>
                    ✨ แนะนำ
                  </div>
                )}

                <div className={`p-6 flex flex-col flex-grow ${pkg.popular ? 'pt-12' : ''}`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: pkg.gradient }}>
                      {pkg.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {pkg.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.nameTh}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {pkg.price}
                    </span>
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                      {pkg.priceNote}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        {feature.included ? (
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ color: '#34d399' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span style={{ color: feature.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={pkg.href}
                    className="btn-solid w-full text-center py-3 flex items-center justify-center gap-2"
                    style={pkg.popular ? { 
                      background: pkg.gradient,
                      borderColor: 'transparent'
                    } : undefined}
                  >
                    {pkg.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-xl font-bold text-center mb-8">
            <span className="gradient-text">เปรียบเทียบแพ็คเกจ</span>
          </h2>

          <div className="cosmic-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th className="py-4 px-4 text-left text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}>ฟีเจอร์</th>
                    <th className="py-4 px-4 text-center text-sm font-bold"
                      style={{ color: 'var(--text-primary)' }}>Free</th>
                    <th className="py-4 px-4 text-center text-sm font-bold"
                      style={{ color: '#8b5cf6' }}>Plus</th>
                    <th className="py-4 px-4 text-center text-sm font-bold"
                      style={{ color: '#fbbf24' }}>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} style={{ 
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-bg)'
                    }}>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {feature.name}
                      </td>
                      <td className="py-3 px-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature.free}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: '#a78bfa' }}>
                        {feature.plus}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: '#fbbf24' }}>
                        {feature.pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-xl font-bold text-center mb-8">
            <span className="gradient-text">คำถามที่พบบ่อย</span>
          </h2>

          <div className="space-y-4">
            <FAQItem 
              question="สามารถเปลี่ยนแพ็คเกจได้ไหม?"
              answer="ได้ คุณสามารถอัปเกรดหรือดาวน์เกรดแพ็คเกจได้ทุกเมื่อ การอัปเกรดจะมีผลทันที ส่วนการดาวน์เกรดจะมีผลในรอบบิลถัดไป"
            />
            <FAQItem 
              question="มีระยะสัญญาผูกมัดไหม?"
              answer="ไม่มี คุณสามารถยกเลิกได้ทุกเมื่อ ไม่มีค่าธรรมเนียมการยกเลิก"
            />
            <FAQItem 
              question="การดูดวง AI ทำงานอย่างไร?"
              answer="AI จะวิเคราะห์ข้อมูลวันเดือนปีเกิดและเวลาเกิดของคุณ จากนั้นสร้างคำทำนายที่เฉพาะเจาะจงสำหรับคุณในด้านต่างๆ 6 ด้าน"
            />
            <FAQItem 
              question="ข้อมูลของฉันปลอดภัยหรือไม่?"
              answer="ปลอดภัย 100% เราเข้ารหัสข้อมูลทั้งหมดและไม่แชร์ข้อมูลส่วนตัวกับบุคคลที่สาม"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="cosmic-card p-8">
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              เริ่มต้นดูดวงฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/reading" className="btn-solid py-3 px-8 flex items-center justify-center gap-2">
                <span>✨</span>
                ดูดวงฟรีเลย
              </Link>
              <Link href="/register?plan=plus" className="btn-ghost py-3 px-8 flex items-center justify-center gap-2">
                <span>🚀</span>
                สมัคร Plus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="cosmic-card p-5">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <span style={{ color: 'var(--accent-primary)' }}>Q:</span>
        {question}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--accent-secondary)' }}>A:</span>{" "}
        {answer}
      </p>
    </div>
  );
}
