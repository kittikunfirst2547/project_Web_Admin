import { Metadata } from "next";
import BackupClient from "./BackupClient";

export const metadata: Metadata = {
  title: "สำรองข้อมูล | Mahoraga Admin",
  description: "สำรองและกู้คืนฐานข้อมูล PostgreSQL",
};

export default function BackupPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Backup & Restore</h1>
      <BackupClient />
    </div>
  );
}
