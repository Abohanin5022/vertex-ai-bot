"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { PackoraLogo } from "@/components/packora-logo";

type LoginResponse = {
  error?: string;
};

export default function MerchantLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/packora-2/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const body = (await response.json()) as LoginResponse;

    if (!response.ok) {
      setError(body.error || "تعذر تسجيل دخول التاجر.");
      setLoading(false);
      return;
    }

    location.href = "/packora-2";
  }

  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#F7FBFF] p-6 text-[#070B2A]"
    >
      <section className="w-full max-w-md rounded-[32px] border border-[#DCEBFF] bg-white p-7 shadow-[0_24px_70px_rgba(23,102,232,0.12)]">
        <div className="text-center">
          <PackoraLogo href="/packora-2" size="desktop" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#1766E8]">
            Packora 2
          </p>
          <h1 className="mt-2 text-3xl font-black">دخول التاجر</h1>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            سجل دخولك لإدارة المنتجات والطلبات والتحليلات وإعدادات متجرك.
          </p>
        </div>

        <form onSubmit={login} className="mt-7 grid gap-4">
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
            placeholder="كلمة المرور"
            className="rounded-2xl border border-[#DCEBFF] px-5 py-4 outline-none focus:border-[#1766E8]"
          />

          <div className="flex justify-end">
            <Link
              href="/packora-2/forgot-password"
              className="text-sm font-semibold text-[#64748B] transition hover:text-[#1766E8]"
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
            className="rounded-2xl bg-[#070B2A] py-4 font-black text-white transition hover:bg-[#1766E8] disabled:opacity-70"
          >
            {loading ? "جاري الدخول..." : "دخول Packora 2"}
          </button>

          <div className="rounded-[24px] border border-[#DCEBFF] bg-[#F8FCFF] p-4 text-center">
            <p className="text-sm font-semibold text-[#64748B]">
              ليس لديك حساب تاجر؟
            </p>
            <p className="mt-1 text-base font-black text-[#070B2A]">
              افتح متجرك وابدأ البيع
            </p>
            <Link
              href="/packora-2/register"
              className="mt-4 block w-full rounded-2xl border border-[#1766E8] bg-white py-4 text-center font-black text-[#1766E8] transition hover:bg-[#F1F8FF]"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
