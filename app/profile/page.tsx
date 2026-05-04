import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "โปรไฟล์ | Mahoraga",
  description: "จัดการข้อมูลและประวัติดูดวง",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      readings: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user || user.isDeleted) {
    redirect("/login");
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden pb-6">
        <div className="absolute inset-0 cosmic-bg opacity-30" />
        <div className="relative mx-auto max-w-4xl px-5 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{ 
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-secondary)'
              }}>
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-secondary)' }} />
              บัญชี
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">โปรไฟล์</span>
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-5 pb-12">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <aside className="cosmic-card p-6 md:col-span-1 h-fit">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-4 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  color: 'var(--bg-primary)'
                }}>
                {userInitial}
              </div>
              
              {/* Name */}
              <h2 className="text-base font-semibold mb-1" 
                style={{ color: 'var(--text-primary)' }}>
                {user.name || "ไม่มีชื่อ"}
              </h2>
              
              {/* Email */}
              <p className="text-xs break-all mb-3" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </p>
              
              {/* Role Badge */}
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide font-medium"
                style={{ 
                  backgroundColor: user.role === "admin" ? 'rgba(167, 139, 250, 0.15)' : 'var(--surface-bg)',
                  color: user.role === "admin" ? '#a78bfa' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: user.role === "admin" ? 'rgba(167, 139, 250, 0.3)' : 'var(--surface-border)'
                }}>
                {user.role === "admin" ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Admin
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Member
                  </>
                )}
              </span>
              
              {/* Join Date */}
              <div className="mt-6 pt-6 w-full" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  สมาชิกตั้งแต่
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(user.createdAt).toLocaleDateString("th-TH", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Edit Profile */}
            <ProfileClient user={{ name: user.name || "", email: user.email }} />

            {/* Reading History */}
            <section className="cosmic-card overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between" 
                style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                    ประวัติดูดวงล่าสุด
                  </h2>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-muted)'
                  }}>
                  {user.readings.length} รายการ
                </span>
              </div>
              
              <div className="p-0">
                {user.readings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <tr>
                          <th className="py-3 px-4 text-left text-[11px] font-medium"
                            style={{ color: 'var(--text-muted)' }}>วันที่</th>
                          <th className="py-3 px-4 text-left text-[11px] font-medium"
                            style={{ color: 'var(--text-muted)' }}>ชื่อ</th>
                          <th className="py-3 px-4 text-left text-[11px] font-medium"
                            style={{ color: 'var(--text-muted)' }}>วันเกิด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.readings.map((reading, idx) => (
                          <tr key={reading.id} 
                            className="transition-colors"
                            style={{ 
                              borderTop: '1px solid var(--border-subtle)',
                              backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-bg)'
                            }}>
                            <td className="py-3 px-4 whitespace-nowrap text-xs"
                              style={{ color: 'var(--text-muted)' }}>
                              {new Date(reading.createdAt).toLocaleString("th-TH", {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </td>
                            <td className="py-3 px-4 font-medium"
                              style={{ color: 'var(--text-primary)' }}>
                              {reading.clientName}
                            </td>
                            <td className="py-3 px-4 text-xs whitespace-nowrap"
                              style={{ color: 'var(--text-secondary)' }}>
                              {reading.birthDate}
                              {reading.birthTime && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  {" "}· {reading.birthTime}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl mb-3"
                      style={{ backgroundColor: 'var(--surface-bg)' }}>
                      🔮
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      ยังไม่มีประวัติดูดวง
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      เริ่มดูดวงครั้งแรกของคุณเลย!
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
