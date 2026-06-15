"use client";

import { useState } from "react";

export function VendorApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    await fetch("/api/vendor-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        category: formData.get("category"),
        notes: formData.get("notes"),
      }),
    });

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-[26px] border border-[#E5E7EB] p-7 text-center">
        <h3 className="text-xl font-semibold">تم إرسال الطلب</h3>
        <p className="mt-3 text-sm leading-7 text-[#6B7280]">
          سنراجع بياناتك ونتواصل معك قريبًا.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <Input name="name" placeholder="اسم المورد أو المنشأة" />
      <Input name="email" type="email" placeholder="البريد الإلكتروني" />
      <Input name="phone" placeholder="رقم الجوال" />
      <Input name="city" placeholder="المدينة" />
      <Input name="category" placeholder="نوع المنتجات" />

      <textarea
        name="notes"
        placeholder="ملاحظات إضافية"
        className="min-h-[118px] rounded-[24px] border border-[#E5E7EB] px-5 py-4 text-sm leading-7 outline-none placeholder:text-[#9CA3AF] focus:border-[#111827]"
      />

      <button
        disabled={loading}
        className="rounded-full bg-black py-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "جاري الإرسال..." : "إرسال طلب الانضمام"}
      </button>
    </form>
  );
}

function Input({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      className="rounded-full border border-[#E5E7EB] px-5 py-4 text-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#111827]"
    />
  );
}
