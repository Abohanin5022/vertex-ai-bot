"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ProductImageUploader } from "@/components/product-image-uploader";

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/products", {
      method: "POST",
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

    if (response.ok) {
      setMessage("تم حفظ المنتج بنجاح");
      setTimeout(() => {
        location.href = "/packora-2/products";
      }, 800);
      return;
    }

    const data = await response.json().catch(() => null);
    setMessage(data?.error || "تعذر حفظ المنتج. تأكد من البيانات ثم حاول مرة أخرى.");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F8FAFC] p-4">
      <section className="mx-auto max-w-4xl">
        <header className="mb-5 rounded-[28px] border border-[#E5E7EB] bg-white p-6">
          <Link
            href="/packora-2/products"
            className="inline-flex rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#111827]"
          >
            رجوع
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Packora 2 Products
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#111827]">
            إضافة منتج جديد
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            أضف بيانات المنتج، صورته، المخزون، الحد الأدنى للطلب، وحالة ظهوره
            في المتجر.
          </p>
        </header>

        <form
          onSubmit={createProduct}
          className="rounded-[28px] border border-[#E5E7EB] bg-white p-6"
        >
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                name="name"
                label="اسم المنتج"
                placeholder="مثال: علب طعام شفافة"
                required
              />

              <Field
                name="category"
                label="التصنيف"
                placeholder="مثال: علب"
                required
              />
            </div>

            <TextArea
              name="description"
              label="وصف المنتج"
              placeholder="اكتب وصفًا واضحًا للمنتج"
            />

            <div className="grid gap-4 md:grid-cols-4">
              <Field
                name="price"
                label="السعر"
                placeholder="25"
                type="number"
                step="0.01"
                required
              />
              <Field
                name="compareAtPrice"
                label="سعر قبل الخصم"
                placeholder="35"
                type="number"
                step="0.01"
              />
              <Field
                name="stock"
                label="المخزون"
                placeholder="100"
                type="number"
                required
              />
              <Field
                name="minOrderQuantity"
                label="أقل كمية للطلب"
                placeholder="1"
                type="number"
                defaultValue="1"
                required
              />
            </div>

            <ProductImageUploader />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                name="weight"
                label="وزن المنتج"
                placeholder="مثال: 1.5"
                type="number"
                step="0.01"
              />
              <Field
                name="dimensions"
                label="أبعاد المنتج"
                placeholder="مثال: 20 × 15 × 10 سم"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Toggle
                name="isActive"
                title="حالة المنتج"
                description="فعّل المنتج ليظهر في المتجر."
                defaultChecked
              />
              <Toggle
                name="isFeatured"
                title="منتج مميز"
                description="استخدمها لإبراز المنتجات المهمة في لوحة التاجر."
              />
            </div>

            {message ? (
              <p className="rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm font-semibold text-[#111827]">
                {message}
              </p>
            ) : null}
          </div>

          <button
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#2563EB] py-5 text-base font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {loading ? "جاري حفظ المنتج..." : "حفظ المنتج"}
          </button>
        </form>
      </section>
    </main>
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
  type = "text",
  step,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#111827]">{label}</span>

      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-full border border-[#E5E7EB] px-5 py-4 text-sm outline-none transition focus:border-[#2563EB]"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#111827]">{label}</span>

      <textarea
        name={name}
        placeholder={placeholder}
        className="min-h-[132px] rounded-[24px] border border-[#E5E7EB] px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#2563EB]"
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
    <label className="flex items-center justify-between gap-4 rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">
      <div>
        <p className="font-semibold text-[#111827]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>

      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-[#2563EB]"
      />
    </label>
  );
}
