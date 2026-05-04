import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "หน้าแรก | Mahoraga",
  description: "ดูดวงด้วย AI แม่นยำ ส่วนตัว — Mahoraga",
};

const features = [
  {
    icon: "✨",
    title: "ดูดวง AI",
    desc: "คำทำนายจากวันเกิด แบ่งหมวดชัดเจน ทั้งการงาน การเงิน ความรัก",
  },
  {
    icon: "🔮",
    title: "ดวงส่วนตัว",
    desc: "เก็บประวัติการดูดวงได้ไม่จำกัด เมื่อเข้าสู่ระบบ",
  },
  {
    icon: "💎",
    title: "ของมงคล",
    desc: "เลือกซื้อเครื่องราง หินมงคล เสริมดวงจากร้านคุณภาพ",
  },
];

const testimonials = [
  { name: "คุณนภา", text: "แบ่งหมวดอ่านง่าย ใช้บนมือถือสะดวกมากค่ะ", role: "นักการตลาด" },
  { name: "คุณธนกร", text: "ลองฟรีแล้วชอบ แนะนำให้เพื่อนร่วมงานใช้เลย", role: "วิศวกร" },
  { name: "คุณมาย", text: "ร้านค้าคัดของได้คุณภาพ สั่งมาหลายครั้งแล้ว", role: "ฟรีแลนซ์" },
];

export default function RootPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cosmic-bg opacity-50" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
            style={{ 
              backgroundColor: 'var(--surface-bg)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-secondary)'
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--accent-secondary)' }} />
            โหราศาสตร์ · AI
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Mahoraga</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            ดูดวงด้วย AI แบบส่วนตัว
            <br />
            <span style={{ color: 'var(--text-tertiary)' }}>กรอกวันเกิดแล้วรับคำทำนายเป็นภาษาไทย</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/reading" className="btn-solid px-8 py-3.5 text-base">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                เริ่มดูดวง
              </span>
            </Link>
            <Link href="/shop" className="btn-line px-8 py-3.5 text-base">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                ร้านของมงคล
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "10K+", label: "ผู้ใช้งาน" },
              { value: "50K+", label: "คำทำนาย" },
              { value: "4.9", label: "คะแนนรีวิว" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center mb-12">
            <h2 className="section-title text-center">บริการของเรา</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              ทุกบริการออกแบบมาเพื่อคุณโดยเฉพาะ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} 
                className="cosmic-card surface-hover p-6 md:p-8 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-primary)/10, var(--accent-secondary)/10)',
                  }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center mb-12">
            <h2 className="section-title text-center">วิธีใช้งาน</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              เพียง 3 ขั้นตอนง่ายๆ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "กรอกข้อมูล", desc: "ใส่ชื่อ วันเกิด และเวลาเกิด (ถ้ามี)" },
              { step: "02", title: "AI วิเคราะห์", desc: "ระบบ AI จะประมวลผลและวิเคราะห์ดวงชะตา" },
              { step: "03", title: "รับคำทำนาย", desc: "ได้รับคำทำนายแบบเจาะลึกทุกด้าน" },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-xl font-bold mb-4"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'var(--bg-primary)'
                  }}>
                  {item.step}
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center mb-12">
            <h2 className="section-title text-center">เสียงจากผู้ใช้งาน</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              รีวิวจากผู้ใช้งานจริง
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.name} 
                className="cosmic-card p-6 relative">
                <div className="text-4xl absolute top-4 right-4 opacity-20"
                  style={{ color: 'var(--accent-primary)' }}>
                  "
                </div>
                <p className="text-sm leading-relaxed mb-4 relative z-10"
                  style={{ color: 'var(--text-secondary)' }}>
                  {t.text}
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      color: 'var(--bg-primary)'
                    }}>
                    {t.name.charAt(2)}
                  </div>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {t.role}
                    </div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="cosmic-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 cosmic-bg opacity-30" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">
                พร้อมดูดวงของคุณหรือยัง?
              </h2>
              <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                เริ่มต้นฟรี ไม่ต้องสมัครสมาชิกก็ใช้งานได้
              </p>
              <Link href="/reading" className="btn-solid px-8 py-3.5 text-base inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                เริ่มดูดวงฟรี
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
