"use client";

import { useState, type FormEvent } from "react";
import { DEFAULT_CATEGORY, type Product } from "@/lib/products";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};

function toFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    category: product?.category ?? DEFAULT_CATEGORY,
  };
}

export function ProductFormModal({
  product,
  existingCategories,
  onClose,
  onSaved,
}: {
  product?: Product;
  existingCategories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(product);
  const [values, setValues] = useState<ProductFormValues>(() =>
    toFormValues(product),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      stock: Number(values.stock),
      category: values.category,
    };

    try {
      const response = await fetch(
        isEditing ? `/api/products/${product!.id}` : "/api/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "تعذر حفظ المنتج.");
        return;
      }

      onSaved();
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-sm border border-hairline bg-paper p-6"
      >
        <h3 id="product-form-title" className="text-lg font-bold">
          {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h3>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink-soft">
              اسم المنتج
            </span>
            <input
              type="text"
              required
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-1 h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none focus:border-tape focus:ring-2 focus:ring-tape/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-soft">
              الوصف
            </span>
            <textarea
              value={values.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={3}
              className="mt-1 w-full rounded-sm border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-tape focus:ring-2 focus:ring-tape/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-soft">
              التصنيف
            </span>
            <input
              type="text"
              list="product-category-options"
              value={values.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              placeholder={DEFAULT_CATEGORY}
              className="mt-1 h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none focus:border-tape focus:ring-2 focus:ring-tape/20"
            />
            <datalist id="product-category-options">
              {existingCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-ink-soft">
                السعر (ر.س)
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => updateField("price", event.target.value)}
                className="mt-1 h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none focus:border-tape focus:ring-2 focus:ring-tape/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink-soft">
                المخزون
              </span>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={values.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                className="mt-1 h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none focus:border-tape focus:ring-2 focus:ring-tape/20"
              />
            </label>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-sm border border-stamp-red-soft bg-stamp-red-soft px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-sm border border-hairline px-4 text-sm font-semibold text-ink-soft transition hover:bg-kraft-deep/60"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-sm bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
}
