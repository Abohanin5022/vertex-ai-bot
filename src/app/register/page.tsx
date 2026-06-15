"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { PackoraLogo } from "@/components/packora-logo";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/packora-1/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "تعذر إنشاء حساب العميل.");
      setLoading(false);
      return;
    }

    location.href = "/packora-1";
  }

  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#F7FBFF] p-6 text-[#070B2A]"
    >
      <section className="w-full max-w-lg rounded-[32px] border border-[#DCEBFF] bg-white p-7 shadow-[0_24px_70px_rgba(23,102,232,0.12)]">
        <div className="text-center">
          <PackoraLogo href="/packora-1" size="desktop" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#1766E8]">
            Packora 1
          </p>
          <h1 className="mt-2 text-3xl font-black">إنشاء حساب عميل</h1>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            أنشئ حسابك للطلب من Packora ومتابعة السلة والطلبات والفواتير.
          </p>
        </div>

        <form onSubmit={register} className="mt-7 grid gap-4">
          <input
            name="name"
            required
            placeholder="الاسم الكامل"
            className="rounded-2xl border border-[#DCEBFF] px-5 py-4 outline-none focus:border-[#1766E8]"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="البريد الإلكتروني"
            className="rounded-2xl border border-[#DCEBFF] px-5 py-4 outline-none focus:border-[#1766E8]"
          />

          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="كلمة المرور"
            className="rounded-2xl border border-[#DCEBFF] px-5 py-4 outline-none focus:border-[#1766E8]"
          />

          {error ? (
            <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="rounded-2xl bg-[#1766E8] py-4 font-black text-white transition hover:bg-[#0f56ca] disabled:opacity-70"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-semibold">
          <Link href="/packora-1/login" className="text-[#1766E8]">
            لدي حساب بالفعل
          </Link>
        </div>
      </section>
    </main>
  );
}
