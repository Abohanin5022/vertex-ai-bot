"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ProductImageUploader } from "@/components/product-image-uploader";

type ProductEditFormProps = {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    minOrderQuantity: number;
    image?: string | null;
    description?: string | null;
    isActive: boolean;
    isFeatured: boolean;
    weight?: number | null;
    dimensions?: string | null;
  };
};

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        price: Number(formData.get("price")),
        compareAtPrice: optionalNumber(formData.get("compareAtPrice")),
        stock: Number(formData.get("stock")),
        minOrderQuantity: Number(formData.get("minOrderQuantity") || 1),
        image: formData.get("image"),
        isActive: formData.get("isActive") === "on",
        isFeatured: formData.get("isFeatured") === "on",
        weight: optionalNumber(formData.get("weight")),
        dimensions: formData.get("dimensions"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(data?.error || "تعذر حفظ التعديل");
      return;
    }

    setMessage("تم حفظ التعديل بنجاح");
    router.refresh();
  }

  return (
    <form
      onSubmit={updateProduct}
      className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6"
    >
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="name"
            label="اسم المنتج"
            defaultValue={product.name}
            placeholder="مثال: علب طعام شفافة"
            required
          />

          <Field
            name="category"
            label="التصنيف"
            defaultValue={product.category}
            placeholder="مثال: علب"
            required
          />
        </div>

        <TextArea
          name="description"
          label="وصف المنتج"
          defaultValue={product.description || ""}
          placeholder="اكتب وصفًا مختصرًا وواضحًا للمنتج"
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Field
            name="price"
            label="السعر"
            type="number"
            step="0.01"
            defaultValue={String(product.price)}
            placeholder="25"
            required
          />
          <Field
            name="compareAtPrice"
            label="سعر قبل الخصم"
            type="number"
            step="0.01"
            defaultValue={
              product.compareAtPrice ? String(product.compareAtPrice) : ""
            }
            placeholder="35"
          />
          <Field
            name="stock"
            label="المخزون"
            type="number"
            defaultValue={String(product.stock)}
            placeholder="100"
            required
          />
          <Field
            name="minOrderQuantity"
            label="أقل كمية للطلب"
            type="number"
            defaultValue={String(product.minOrderQuantity || 1)}
            placeholder="1"
            required
          />
        </div>

        <ProductImageUploader defaultValue={product.image} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            name="weight"
            label="وزن المنتج"
            type="number"
            step="0.01"
            defaultValue={product.weight ? String(product.weight) : ""}
            placeholder="مثال: 1.5"
          />
          <Field
            name="dimensions"
            label="أبعاد المنتج"
            defaultValue={product.dimensions || ""}
            placeholder="مثال: 20 × 15 × 10 سم"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            name="isActive"
            title="حالة المنتج"
            description="المنتج المتوفر يظهر في واجهات البيع."
            defaultChecked={product.isActive}
          />
          <Toggle
            name="isFeatured"
            title="منتج مميز"
            description="ضع علامة تميز للمنتجات المهمة."
            defaultChecked={product.isFeatured}
          />
        </div>

        {message ? (
          <p className="rounded-[18px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-4 text-sm font-semibold text-[var(--packora-navy)]">
            {message}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_2fr] gap-3">
        <Link
          href="/packora-2/products"
          className="rounded-full border border-[var(--packora-border)] py-4 text-center font-semibold text-[var(--packora-navy)]"
        >
          إلغاء
        </Link>

        <button
          disabled={loading}
          className="rounded-full bg-[var(--packora-blue)] py-4 font-semibold text-white transition hover:bg-[var(--packora-blue-dark)] disabled:opacity-60"
        >
          {loading ? "جاري الحفظ..." : "حفظ التعديل"}
        </button>
      </div>
    </form>
  );
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") {
    return null;
  }

  return Number(value);
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
  type = "text",
  step,
  required = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--packora-navy)]">
        {label}
      </span>

      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-full border border-[var(--packora-border)] px-5 py-4 text-sm outline-none transition focus:border-[var(--packora-blue)]"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--packora-navy)]">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-[132px] rounded-[24px] border border-[var(--packora-border)] px-5 py-4 text-sm leading-7 outline-none transition focus:border-[var(--packora-blue)]"
      />
    </label>
  );
}

function Toggle({
  name,
  title,
  description,
  defaultChecked = false,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-[24px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-5">
      <div>
        <p className="font-semibold text-[var(--packora-navy)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>

      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-[var(--packora-blue)]"
      />
    </label>
  );
}
