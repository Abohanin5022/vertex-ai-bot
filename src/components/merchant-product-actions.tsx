"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MerchantProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string | null;
  description?: string | null;
  compareAtPrice?: number | null;
  minOrderQuantity?: number;
  isFeatured?: boolean;
  isActive: boolean;
  weight?: number | null;
  dimensions?: string | null;
};

type MerchantProductActionsProps = {
  product: MerchantProduct;
  storeSlug?: string | null;
};

export function MerchantProductActions({
  product,
  storeSlug,
}: MerchantProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"toggle" | "delete" | "copy" | null>(
    null
  );

  async function toggleStatus() {
    setLoading("toggle");

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !product.isActive,
      }),
    });

    setLoading(null);

    if (!response.ok) {
      alert("تعذر تحديث حالة المنتج");
      return;
    }

    router.refresh();
  }

  async function duplicateProduct() {
    setLoading("copy");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${product.name} - نسخة`,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        minOrderQuantity: product.minOrderQuantity || 1,
        image: product.image,
        description: product.description,
        isActive: false,
        isFeatured: product.isFeatured,
        weight: product.weight,
        dimensions: product.dimensions,
      }),
    });

    setLoading(null);

    if (!response.ok) {
      alert("تعذر نسخ المنتج");
      return;
    }

    router.refresh();
  }

  async function deleteProduct() {
    const confirmed = confirm(
      "سيتم إخفاء المنتج من المتجر بدل حذفه نهائيًا. هل تريد المتابعة؟"
    );

    if (!confirmed) {
      return;
    }

    setLoading("delete");

    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });

    setLoading(null);

    if (!response.ok) {
      alert("تعذر حذف المنتج");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Link
        href={`/packora-2/products/${product.id}/edit`}
        className="rounded-full border border-[var(--packora-border)] py-3 text-center text-sm font-semibold text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
      >
        تعديل
      </Link>

      <button
        type="button"
        disabled={loading === "toggle"}
        onClick={toggleStatus}
        className="rounded-full border border-amber-200 bg-amber-50 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
      >
        {loading === "toggle" ? "..." : product.isActive ? "تعطيل" : "تفعيل"}
      </button>

      <button
        type="button"
        disabled={loading === "copy"}
        onClick={duplicateProduct}
        className="rounded-full border border-[var(--packora-border)] bg-white py-3 text-sm font-semibold text-[var(--packora-navy)] transition hover:bg-[var(--packora-cyan)] disabled:opacity-60"
      >
        {loading === "copy" ? "..." : "نسخ المنتج"}
      </button>

      <button
        type="button"
        disabled={loading === "delete"}
        onClick={deleteProduct}
        className="rounded-full border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {loading === "delete" ? "..." : "حذف"}
      </button>

      {storeSlug ? (
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="col-span-2 rounded-full bg-[var(--packora-navy)] py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--packora-blue)]"
        >
          معاينة المتجر للعميل
        </Link>
      ) : null}
    </div>
  );
}
