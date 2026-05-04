"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          if (!cancelled) setProduct(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleOrder = async () => {
    if (!product || product.stock < 1) return;
    if (status !== "authenticated" || !session?.user) {
      router.push(`/login?next=/shop/${product.id}`);
      return;
    }
    setOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message ?? "สั่งซื้อไม่สำเร็จ", "error");
        return;
      }
      showToast(data.message ?? "สั่งซื้อสำเร็จแล้ว");
      setProduct((p) => (p ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    } catch {
      showToast("เกิดข้อผิดพลาดในการสั่งซื้อ", "error");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <div className="mx-auto mb-3 h-px w-8 bg-white/15 animate-pulse" />
        <p className="text-xs text-gray-500">กำลังโหลด</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="text-sm text-gray-400 mb-6">ไม่พบสินค้า</p>
        <Link href="/shop" className="text-xs text-gray-500 hover:text-white underline underline-offset-4">
          กลับร้านค้า
        </Link>
      </div>
    );
  }

  const img =
    product.imageUrl ||
    `https://placehold.co/560x560/1a0d33/e8c97a?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 animate-fade-in">
      <Link
        href="/shop"
        className="mb-8 inline-block text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← ร้านค้า
      </Link>

      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="surface overflow-hidden aspect-square bg-white/[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">{product.category}</p>
          <h1 className="text-xl font-semibold text-white mb-4">{product.name}</h1>
          <p className="mb-8 text-xl font-medium tabular-nums text-white">
            ฿{product.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-8 flex-grow">{product.description}</p>

          <div className="mb-6 space-y-1 text-xs text-gray-500">
            {product.stock > 0 && product.stock < 5 && (
              <p className="text-amber-200/70">คงเหลือไม่มาก</p>
            )}
            <p>
              คงเหลือ <span className="text-gray-300">{product.stock}</span> ชิ้น
            </p>
          </div>

          <button
            type="button"
            onClick={handleOrder}
            disabled={product.stock === 0 || ordering}
            className="btn-solid w-full md:w-auto disabled:opacity-35"
          >
            {product.stock === 0 ? "หมด" : ordering ? "กำลังดำเนินการ…" : "สั่งซื้อ"}
          </button>
        </div>
      </div>
    </div>
  );
}
