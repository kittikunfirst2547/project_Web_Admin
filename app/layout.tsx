import "@/lib/env";
import "./globals.css";
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Link from "next/link";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahoraga | ดูดวงออนไลน์ด้วย AI",
  description: "แอปพลิเคชันดูดวงไทยด้วยระบบ AI ที่แม่นยำและเป็นส่วนตัว",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${sarabun.className} text-[15px] leading-relaxed min-h-screen flex flex-col antialiased cosmic-bg`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <footer className="border-t py-12 mt-auto" style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)' 
              }}>
                <div className="container mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md text-xs"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        color: 'var(--bg-primary)'
                      }}>
                      ✦
                    </span>
                    <p>© 2025 Mahoraga</p>
                  </div>
                  <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                    <FooterLink href="/">หน้าแรก</FooterLink>
                    <FooterLink href="/reading">ดูดวง</FooterLink>
                    <FooterLink href="/shop">ร้านค้า</FooterLink>
                    <FooterLink href="/privacy">ความเป็นส่วนตัว</FooterLink>
                  </nav>
                </div>
              </footer>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="transition-colors hover:text-[var(--text-secondary)]"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </Link>
  );
}
