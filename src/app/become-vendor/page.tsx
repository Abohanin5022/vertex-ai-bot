"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Building2, FileUp, MapPin, Phone } from "lucide-react";
import { PackoraLogo } from "@/components/packora-logo";

export default function BecomeVendorPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [registryFile, setRegistryFile] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/vendor-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("storeName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        category: "طلب متجر",
        notes: [
          `اسم المسؤول: ${formData.get("ownerName") || ""}`,
          `السجل التجاري: ${registryFile || "لم يرفق"}`,
          `ملاحظات: ${formData.get("notes") || ""}`,
        ].join("\n"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("تعذر إرسال طلب المتجر. حاول مرة أخرى.");
      return;
    }

    setDone(true);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#EAFBFF] p-6 text-[var(--packora-navy)]">
      <section className="mx-auto grid max-w-5xl gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <aside className="rounded-[34px] border border-[var(--packora-border)] bg-white p-7 shadow-[0_24px_70px_rgba(23,102,232,0.10)]">
          <PackoraLogo href="/packora-1" size="desktop" />
          <p className="mt-8 text-sm font-semibold text-[var(--packora-blue)]">
            افتح متجرك معنا
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight">
            انضم إلى موردي Packora
          </h1>
          <p className="mt-4 text-sm leading-8 text-[#64748B]">
            أرسل طلب متجرك، وبعد مراجعة الإدارة والموافقة سيتم إنشاء حساب التاجر وإرسال بيانات الدخول لك.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              { icon: Building2, title: "طلب متجر مستقل" },
              { icon: FileUp, title: "إرفاق السجل التجاري" },
              { icon: Phone, title: "تواصل مباشر بعد الموافقة" },
              { icon: MapPin, title: "تحديد المدينة ونطاق الخدمة" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--packora-border)] bg-white p-4"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
                    <Icon size={20} />
                  </span>
                  <span className="font-semibold">{item.title}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[34px] border border-[var(--packora-border)] bg-white p-7 shadow-[0_24px_70px_rgba(23,102,232,0.10)]">
          {done ? (
            <div className="grid min-h-[480px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--packora-cyan)] text-3xl">
                  ✓
                </div>
                <h2 className="mt-6 text-3xl font-black">تم إرسال الطلب</h2>
                <p className="mt-3 leading-8 text-[#64748B]">
                  سنراجع بيانات المتجر، وبعد الموافقة سيصلك حساب التاجر وبيانات الدخول.
                </p>
                <Link
                  href="/packora-1"
                  className="mt-7 inline-block rounded-2xl bg-[var(--packora-blue)] px-7 py-4 font-black text-white"
                >
                  الرجوع للمتجر
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black">طلب فتح متجر</h2>
              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                املأ البيانات الأساسية، وسيتم التواصل معك بعد المراجعة.
              </p>

              <form onSubmit={submit} className="mt-7 grid gap-4">
                <input
                  name="storeName"
                  required
                  placeholder="اسم المتجر أو المنشأة"
                  className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                <input
                  name="ownerName"
                  required
                  placeholder="اسم المسؤول"
                  className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                <input
                  name="phone"
                  required
                  inputMode="tel"
                  placeholder="رقم الجوال"
                  className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                <input
                  name="city"
                  required
                  placeholder="المدينة"
                  className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                <label className="grid cursor-pointer gap-2 rounded-2xl border border-dashed border-[var(--packora-border)] bg-[#F8FAFC] p-5">
                  <span className="font-semibold">رفع السجل التجاري</span>
                  <span className="text-sm text-[#64748B]">
                    {registryFile || "اختر ملف PDF أو صورة للسجل"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(event) =>
                      setRegistryFile(event.currentTarget.files?.[0]?.name || "")
                    }
                  />
                </label>

                <textarea
                  name="notes"
                  placeholder="ملاحظات إضافية"
                  className="min-h-28 rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
                />

                {error ? (
                  <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {error}
                  </p>
                ) : null}

                <button
                  disabled={loading}
                  className="rounded-2xl bg-[var(--packora-navy)] py-4 font-black text-white transition hover:bg-[#11183f] disabled:opacity-70"
                >
                  {loading ? "جاري إرسال الطلب..." : "إرسال طلب المتجر"}
                </button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
