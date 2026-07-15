"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "تعذر تسجيل الدخول.");
        return;
      }

      const next = searchParams.get("next") || "/";
      router.replace(next);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-kraft px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-hairline bg-paper p-6"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tape-deep">
          Packora
        </p>
        <h1 className="mt-2 text-2xl font-bold">تسجيل الدخول للوحة</h1>
        <p className="mt-2 text-sm text-ink-soft">
          أدخل كلمة المرور للوصول إلى لوحة التشغيل.
        </p>

        <label className="mt-6 block">
          <span className="sr-only">كلمة المرور</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            required
            placeholder="كلمة المرور"
            className="h-11 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none transition focus:border-tape focus:ring-2 focus:ring-tape/20"
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-sm border border-stamp-red-soft bg-stamp-red-soft px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-11 w-full rounded-sm bg-ink text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
