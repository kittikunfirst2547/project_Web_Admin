import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";

export const metadata: Metadata = {
  title: "จัดการผู้ใช้ | Mahoraga Admin",
  description: "รายชื่อผู้ใช้และการจัดการสิทธิ์",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    include: { _count: { select: { readings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ผู้ใช้ทั้งหมด</h1>
      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isBanned: u.isBanned,
          readings: u._count.readings,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
