import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ดูดวงด้วย AI | Mahoraga",
  description: "กรอกวันเกิดรับคำทำนายแบบแบ่งหมวด — โหราศาสตร์ไทยด้วย AI",
};

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
