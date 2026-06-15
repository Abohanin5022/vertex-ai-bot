"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { PackoraLogo } from "@/components/packora-logo";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/packora-1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "تعذر تسجيل دخول العميل.");
      setLoading(false);
      return;
    }

    location.href = "/packora-1";
  }

  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#EAFBFF] p-6 text-[var(--packora-navy)]"
    >
      <section className="w-full max-w-md rounded-[32px] border border-[var(--packora-border)] bg-white p-7 shadow-[0_24px_70px_rgba(23,102,232,0.12)]">
        <div className="text-center">
          <PackoraLogo href="/packora-1" size="desktop" />
          <p className="mt-5 text-sm font-semibold text-[#64748B]">
            Packora 1
          </p>
          <h1 className="mt-2 text-3xl font-black">دخول العميل</h1>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            سجل دخولك لإدارة طلباتك وسلتك داخل تطبيق العميل.
          </p>
        </div>

        <form onSubmit={login} className="mt-7 grid gap-4">
          <input
            name="email"
            type="email"
            required
            placeholder="البريد الإلكتروني"
            className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="كلمة المرور"
            className="rounded-2xl border border-[var(--packora-border)] px-5 py-4 outline-none focus:border-[var(--packora-blue)]"
          />

          <div className="flex justify-end">
            <Link
              href="/packora-1/forgot-password"
              className="text-sm font-semibold text-[#64748B] transition hover:text-[var(--packora-blue)]"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          {error ? (
            <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="rounded-2xl bg-[var(--packora-blue)] py-4 font-black text-white transition hover:bg-[var(--packora-blue-dark)] disabled:opacity-70"
          >
            {loading ? "جاري الدخول..." : "دخول العميل"}
          </button>

          <div className="rounded-[24px] border border-[var(--packora-border)] bg-[#F8FCFF] p-4 text-center">
            <p className="text-sm font-semibold text-[#64748B]">
              ليس لديك حساب؟
            </p>
            <p className="mt-1 text-base font-black text-[#070B2A]">
              أنشئ حسابًا مجانًا الآن
            </p>
            <Link
            href="/packora-1/register"
              className="mt-4 block w-full rounded-2xl border border-[var(--packora-blue)] bg-white py-4 text-center font-black text-[var(--packora-blue)] transition hover:bg-[#F1F8FF]"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
