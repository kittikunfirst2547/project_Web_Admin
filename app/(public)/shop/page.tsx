import { prisma } from "@/lib/prisma";
import ProductGrid from "./ProductGrid";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ร้านค้า | Mahoraga",
  description: "ของมงคลและเครื่องราง",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="relative overflow-hidden pb-8">
        <div className="absolute inset-0 cosmic-bg opacity-30" />
        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-medium"
              style={{ 
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-secondary)'
              }}>
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-secondary)' }} />
              ร้านค้า
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text">ของมงคล</span>
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              เครื่องราง หินมงคล และของเสริมดวงคุณภาพ คัดสรรโดยผู้เชี่ยวชาญ
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-5xl px-5">
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
