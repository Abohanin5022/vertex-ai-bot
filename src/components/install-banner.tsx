"use client";

import Link from "next/link";
import { Download, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { usePWA } from "@/hooks/use-pwa";

export function InstallBanner() {
  const { canInstall, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-[28px] border border-[var(--packora-border)] bg-white p-4 text-[var(--packora-navy)] shadow-[0_24px_70px_rgba(7,11,42,0.22)]"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="إغلاق"
        className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F8FAFC] text-[#6B7280]"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-4 pl-9">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
          <Smartphone size={26} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-black">ثبّت Packora كتطبيق</h2>

          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            وصول أسرع، تجربة شاشة كاملة، واستعداد للعمل دون اتصال لاحقًا.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={install}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--packora-blue)] px-5 py-3 text-sm font-black text-white"
        >
          <Download size={18} />
          تثبيت التطبيق
        </button>

        <Link
          href="/app-download"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--packora-border)] px-4 py-3 text-sm font-semibold"
        >
          التفاصيل
        </Link>
      </div>
    </div>
  );
}
