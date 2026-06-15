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
      className="flex h-12 items-center gap-2 rounded-2xl border border-[var(--packora-border)] bg-[#F8FCFF] px-3"
    >
      <Search size={18} className="shrink-0 text-[var(--packora-blue)]" />

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ابحث عن منتج أو تصنيف"
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
      />

      <button
        type="submit"
        aria-label="تصفية"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#64748B] shadow-sm"
      >
        <SlidersHorizontal size={16} />
      </button>
    </form>
  );
}
