"use client";

import { type FormEvent, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export function MobileSearch({ initialValue = "" }: { initialValue?: string }) {
  const [search, setSearch] = useState(initialValue);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();
    location.href = query ? `/packora-1?q=${encodeURIComponent(query)}` : "/packora-1";
  }

  return (
    <form
      dir="rtl"
      onSubmit={submitSearch}
      className="flex h-14 items-center gap-2 rounded-[22px] border border-[var(--packora-border)] bg-white px-4 shadow-[0_12px_28px_rgba(236,72,153,0.08)] transition focus-within:border-[var(--packora-blue)]"
    >
      <Search size={18} className="shrink-0 text-[var(--packora-blue)]" />

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ابحث عن منتج أو تصنيف"
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--packora-navy)] outline-none placeholder:text-[#94A3B8]"
      />

      <button
        type="submit"
        aria-label="تصفية"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]"
      >
        <SlidersHorizontal size={16} />
      </button>
    </form>
  );
}
