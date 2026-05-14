"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Client-side component ที่บันทึก access log ทุกครั้งที่เปลี่ยนหน้า
 * ใช้แทนการ fetch ใน middleware (ที่มีปัญหากับ Edge Runtime + NEXTAUTH_URL)
 */
export default function AccessLogTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    // กัน log ซ้ำเมื่อ component re-render โดย path ไม่เปลี่ยน
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    // ส่ง access log แบบ fire-and-forget
    fetch("/api/admin/access-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.user?.id || null,
        path: pathname,
        method: "GET",
      }),
    }).catch(() => {
      // Silent fail
    });
  }, [pathname, session?.user?.id]);

  return null; // ไม่ render อะไร
}
