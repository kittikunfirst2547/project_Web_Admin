"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string | null;
};

const CATS = ["พระเครื่อง", "หินมงคล", "เครื่องรางนำโชค", "ทั่วไป"];

export default function ProductsAdminClient() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: 199,
    stock: 10,
    category: "ทั่วไป",
    isActive: true,
    imageUrl: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/products", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner("");
    try {
      const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner(data.message ?? "ไม่สำเร็จ");
        return;
      }
      setBanner(editId ? "อัปเดตสินค้าแล้ว" : "เพิ่มสินค้าแล้ว");
      setForm(emptyForm);
      setEditId(null);
      await load();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: ProductRow) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      isActive: p.isActive,
      imageUrl: p.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (p: ProductRow) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      await load();
      router.refresh();
    }
  };

  const softDelete = async (p: ProductRow) => {
    if (!confirm(`ปิดการใช้งาน ${p.name}?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      await load();
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {banner && (
        <p 
          className="rounded-md px-4 py-2 text-xs"
          style={{
            backgroundColor: 'var(--surface-bg)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-muted)'
          }}
        >
          {banner}
        </p>
      )}

      <form
        onSubmit={submit}
        className="surface max-w-2xl space-y-4 p-6"
      >
        <h2 
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {editId ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="field-label">ชื่อ</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="field-input"
            />
          </label>
          <label className="md:col-span-2">
            <span className="field-label">คำอธิบาย</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="field-input min-h-[5rem]"
            />
          </label>
          <label>
            <span className="field-label">ราคา</span>
            <input
              type="number"
              min={1}
              step={1}
              required
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">สต็อก</span>
            <input
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: Number(e.target.value) }))
              }
              className="field-input"
            />
          </label>
          <label className="md:col-span-2">
            <span className="field-label">หมวดหมู่</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="field-input"
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label 
            className="flex items-center gap-2 text-xs md:col-span-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            แสดงสินค้า (active)
          </label>
          <label className="md:col-span-2">
            <span className="field-label">URL รูปภาพ</span>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="field-input"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-solid disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-line"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              ยกเลิกแก้ไข
            </button>
          )}
        </div>
      </form>

      <div className="surface overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead 
            className="border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>รูป</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ชื่อ</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>หมวด</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>ราคา</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>สต็อก</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>สถานะ</th>
              <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>การทำงาน</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr 
                key={p.id} 
                className="border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className="p-3">
                  <div 
                    className="h-10 w-10 overflow-hidden rounded"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div 
                        className="flex h-full w-full items-center justify-center text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ✦
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                <td 
                  className="p-3 tabular-nums" 
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ฿{p.price.toLocaleString()}
                </td>
                <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{p.stock}</td>
                <td className="p-3">
                  {p.isActive ? (
                    <span className="text-xs" style={{ color: '#34d399' }}>ขาย</span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ปิด</span>
                  )}
                </td>
                <td className="p-3 space-x-1 whitespace-nowrap">
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                    onClick={() => startEdit(p)}
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ backgroundColor: 'var(--surface-hover)' }}
                    onClick={() => toggleActive(p)}
                  >
                    สลับ active
                  </button>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171'
                    }}
                    onClick={() => softDelete(p)}
                  >
                    ปิดขาย
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
