"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, type ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "ภาพรวม" },
  { href: "/dashboard/users", label: "ผู้ใช้" },
  { href: "/dashboard/monitoring", label: "Monitoring" },
  { href: "/dashboard/backup", label: "Backup" },
  { href: "/dashboard/products", label: "สินค้า" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <aside 
      className="flex min-h-screen w-52 shrink-0 flex-col border-r"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div 
        className="px-4 py-5 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Link 
          href="/dashboard" 
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Admin
        </Link>
        <p 
          className="mt-1 text-sm"
          style={{ color: 'var(--text-primary)' }}
        >
          Mahoraga
        </p>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-xs transition-colors"
            style={pathname === item.href ? {
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-primary)'
            } : {
              color: 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (pathname !== item.href) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== item.href) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div 
        className="space-y-2 border-t p-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p 
          className="truncate text-[10px]"
          style={{ color: 'var(--text-muted)' }}
        >
          {session?.user?.email}
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-md border py-2 text-[11px] transition-colors"
          style={{ 
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          ออกจากระบบ
        </button>
        <Link 
          href="/home" 
          className="block text-center text-[10px] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          หน้าแรก
        </Link>
      </div>
    </aside>
  );

  return (
    <div 
      className="flex min-h-screen"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="hidden lg:flex">{Sidebar}</div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header 
          className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span 
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            แผงผู้ดูแล
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-[11px]"
            style={{ 
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)'
            }}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "ปิด" : "เมนู"}
          </button>
        </header>
        {open && (
          <div 
            className="border-b lg:hidden"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {Sidebar}
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
