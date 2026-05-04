import { Metadata } from "next";
import MonitoringClient from "./MonitoringClient";

export const metadata: Metadata = {
  title: "Monitoring | Mahoraga Admin",
  description: "สุขภาพระบบและบันทึกคำขอ",
};

export default function MonitoringPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Monitoring</h1>
      <MonitoringClient />
    </div>
  );
}
