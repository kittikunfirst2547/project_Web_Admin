import { Metadata } from "next";
import ProductsAdminClient from "./ProductsAdminClient";

export const metadata: Metadata = {
  title: "จัดการสินค้า | Mahoraga Admin",
  description: "เพิ่ม แก้ไข และปิดการใช้งานสินค้า",
};

export default function AdminProductsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>สินค้า</h1>
      <ProductsAdminClient />
    </div>
  );
}
