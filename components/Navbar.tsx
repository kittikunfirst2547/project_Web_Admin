"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 cosmic-bg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="absolute inset-0 border-b" style={{ borderColor: 'var(--border-subtle)' }} />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-[15px] font-semibold tracking-wide transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onClick={closeMobile}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'var(--bg-primary)'
            }}>
            ✦
          </span>
          <span className="gradient-text">Mahoraga</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          <NavLink href="/reading">ดูดวง</NavLink>
          <NavLink href="/shop">ร้านค้า</NavLink>
          <NavLink href="/packages">แพ็คเกจ</NavLink>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-md" style={{ backgroundColor: 'var(--surface-bg)' }} />
          ) : session?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200"
                style={{ 
                  backgroundColor: 'var(--surface-bg)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'var(--bg-primary)'
                  }}>
                  {session.user.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : session.user.email?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="max-w-[120px] truncate text-xs">
                  {session.user.name || session.user.email?.split("@")[0]}
                </span>
                <svg className="h-3 w-3" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl py-2 z-50 shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    โปรไฟล์
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      แดชบอร์ด
                    </Link>
                  )}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs transition-colors text-red-400/80 hover:text-red-400"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost py-2 text-xs">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="btn-solid py-2 text-xs">
                สมัคร
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="เมนู"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-fade-in"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-subtle)'
          }}>
          <div className="px-5 py-4 flex flex-col gap-1">
            <MobileNavLink href="/reading" onClick={closeMobile}>ดูดวง</MobileNavLink>
            <MobileNavLink href="/shop" onClick={closeMobile}>ร้านค้า</MobileNavLink>
            <MobileNavLink href="/packages" onClick={closeMobile}>แพ็คเกจ</MobileNavLink>
            
            {session?.user ? (
              <>
                <div className="my-2 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                <MobileNavLink href="/profile" onClick={closeMobile}>โปรไฟล์</MobileNavLink>
                {session.user.role === "admin" && (
                  <MobileNavLink href="/dashboard" onClick={closeMobile}>แดชบอร์ด</MobileNavLink>
                )}
                <button
                  type="button"
                  className="py-2 text-left text-sm text-red-400/80 hover:text-red-400 transition-colors"
                  onClick={() => {
                    closeMobile();
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/login" className="btn-line justify-center py-2 text-xs" onClick={closeMobile}>
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="btn-solid justify-center py-2 text-xs" onClick={closeMobile}>
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="relative text-sm font-medium transition-colors py-1 group"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span className="group-hover:text-[var(--text-primary)] transition-colors">{children}</span>
      <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full"
        style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} 
      />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      className="py-2.5 text-sm font-medium transition-colors rounded-lg px-3 -mx-3"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
