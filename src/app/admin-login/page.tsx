"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { PackoraLogo } from "@/components/packora-logo";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        role: "admin",
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error || "تعذر تسجيل دخول الإدارة.");
      setLoading(false);
      return;
    }

    location.href = "/admin";
  }

  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#070B2A] p-6 text-white"
    >
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white p-7 text-[#070B2A] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div className="text-center">
          <PackoraLogo href="/admin-login" size="desktop" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#1766E8]">
            Packora Admin
          </p>
          <h1 className="mt-2 text-3xl font-black">دخول الإدارة</h1>
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

          {error ? (
            <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="rounded-2xl bg-[#070B2A] py-4 font-black text-white transition hover:bg-[#1766E8] disabled:opacity-70"
          >
            {loading ? "جاري الدخول..." : "دخول Packora Admin"}
          </button>
        </form>

        <Link
          href="/packora-2/login"
          className="mt-6 block text-center text-sm font-semibold text-[#64748B]"
        >
          دخول التاجر
        </Link>
      </section>
    </main>
  );
}
