"use client";

import Link from "next/link";
import { useState } from "react";

export function CopyStoreLink({ slug }: { slug?: string | null }) {
  const [copied, setCopied] = useState(false);
  const path = slug ? `/store/${slug}` : "";

  async function copy() {
    if (!path) return;

    const url = `${window.location.origin}${path}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-[22px] border border-[var(--packora-border)] bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-[var(--packora-navy)]">
        معاينة المتجر للعميل
      </p>

      {slug ? (
        <>
          <p className="mt-2 truncate text-xs text-[var(--packora-muted)]">
            {path}
          </p>

          <button
            onClick={copy}
            className="mt-4 w-full rounded-full bg-[var(--packora-navy)] py-3 text-sm font-semibold text-white"
          >
            {copied ? "تم النسخ" : "نسخ رابط المعاينة"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs leading-6 text-[var(--packora-muted)]">
            لا يوجد متجر مرتبط بهذا الحساب. أكمل إعدادات المتجر لإنشاء رابط
            المعاينة.
          </p>

          <Link
            href="/packora-2/settings"
            className="mt-4 block w-full rounded-full bg-[var(--packora-navy)] py-3 text-center text-sm font-semibold text-white"
          >
            إعدادات المتجر
          </Link>
        </>
      )}
    </div>
  );
}
