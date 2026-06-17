"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export function StoreShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyStoreLink() {
    const origin = window.location.origin;
    await navigator.clipboard.writeText(`${origin}/store/${slug}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyStoreLink}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--packora-border)] bg-white px-5 py-3 text-sm font-black text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-light-pink)]"
    >
      <Copy size={17} />
      {copied ? "تم النسخ" : "نسخ رابط المتجر"}
    </button>
  );
}
