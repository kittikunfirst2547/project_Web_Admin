import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ความเป็นส่วนตัว | Mahoraga",
  description: "นโยบายความเป็นส่วนตัว",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 animate-fade-in">
      <h1 className="text-lg font-semibold text-white mb-8">ความเป็นส่วนตัว</h1>
      <div className="space-y-5 text-sm text-gray-400 leading-relaxed">
        <p>
          Mahoraga เก็บข้อมูลที่จำเป็นเพื่อให้บริการดูดวงและร้านค้า เราไม่ขายข้อมูลส่วนบุคคลให้บุคคลที่สาม
        </p>
        <p>
          รหัสผ่านถูกเข้ารหัส และคุณสามารถขอลบบัญชีได้จากหน้าโปรไฟล์
        </p>
      </div>
    </div>
  );
}
