"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ShopProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

const TABS = ["ทั้งหมด", "พระเครื่อง", "หินมงคล", "เครื่องรางนำโชค"];

const CATEGORY_ICONS: Record<string, string> = {
  "พระเครื่อง": "🙏",
  "หินมงคล": "💎",
  "เครื่องรางนำโชค": "🍀",
};

export default function ProductGrid({ products }: { products: ShopProduct[] }) {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const filtered = useMemo(() => {
    if (activeCategory === "ทั้งหมด") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
          style={{ backgroundColor: 'var(--surface-bg)' }}>
          📦
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          ยังไม่มีสินค้า
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className="rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: activeCategory === cat ? 'var(--accent-primary)' : 'var(--surface-bg)',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: activeCategory === cat ? 'transparent' : 'var(--surface-border)',
            }}
          >
            <span className="flex items-center gap-1.5">
              {cat !== "ทั้งหมด" && (
                <span>{CATEGORY_ICONS[cat] || "✦"}</span>
              )}
              {cat}
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product) => (
          <article
            key={product.id}
            className="cosmic-card surface-hover flex flex-col h-full group"
          >
            {/* Image Section */}
            <Link 
              href={`/shop/${product.id}`} 
              className="block aspect-[4/3] w-full relative overflow-hidden rounded-t-xl"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-4xl opacity-30"
                    style={{ color: 'var(--accent-primary)' }}>
                    {CATEGORY_ICONS[product.category] || "✦"}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} 
              />
              
              {/* Stock Badge */}
              {product.stock < 5 && product.stock > 0 && (
                <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'rgba(251, 191, 36, 0.9)',
                    color: '#451a03'
                  }}>
                  เหลือน้อย
                </span>
              )}
              {product.stock === 0 && (
                <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: 'white'
                  }}>
                  สินค้าหมด
                </span>
              )}
            </Link>

            <div className="p-5 flex flex-col flex-grow">
              {/* Category */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">{CATEGORY_ICONS[product.category] || "✦"}</span>
                <p className="text-[10px] uppercase tracking-widest font-medium"
                  style={{ color: 'var(--text-muted)' }}>
                  {product.category}
                </p>
              </div>
              
              {/* Name */}
              <Link href={`/shop/${product.id}`}>
                <h3 className="mb-2 text-base font-semibold transition-colors line-clamp-1 group-hover:text-[var(--accent-primary)]"
                  style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </h3>
              </Link>
              
              {/* Description */}
              <p className="text-xs line-clamp-2 mb-4 flex-grow leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}>
                {product.description}
              </p>
              
              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 mt-auto"
                style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-lg font-bold tabular-nums"
                  style={{ color: 'var(--text-primary)' }}>
                  ฿{product.price.toLocaleString()}
                </span>
                <Link 
                  href={`/shop/${product.id}`} 
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  <span className="flex items-center gap-1">
                    รายละเอียด
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && products.length > 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ backgroundColor: 'var(--surface-bg)' }}>
            🔍
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ไม่มีสินค้าในหมวดนี้
          </p>
        </div>
      )}
    </>
  );
}
