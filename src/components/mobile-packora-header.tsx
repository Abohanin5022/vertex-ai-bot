"use client";

import Link from "next/link";
import { MapPin, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { MobileMenu, type MenuProduct } from "@/components/mobile-menu";
import { MobileSearch } from "@/components/mobile-search";
import { PackoraLogo } from "@/components/packora-logo";

export function MobilePackoraHeader({
  initialSearch = "",
  showSearch = true,
  products = [],
}: {
  initialSearch?: string;
  showSearch?: boolean;
  products?: MenuProduct[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-50 border-b border-[var(--packora-border)] bg-white/95 backdrop-blur"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--packora-border)] bg-white text-[#111827] transition hover:border-[var(--packora-orange)] hover:bg-[#FFF7ED]"
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div className="min-w-0 flex-1">
              <PackoraLogo />
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                <MapPin size={13} className="text-[var(--packora-orange)]" />
                <span className="truncate">التوصيل إلى موقعك الحالي</span>
              </div>
            </div>

            <Link
              href="/packora-1/cart"
              aria-label="السلة"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--packora-blue)] text-white transition hover:bg-[var(--packora-blue-dark)]"
            >
              <ShoppingCart size={19} />
            </Link>
          </div>

          {showSearch ? (
            <div className="mt-3">
              <MobileSearch initialValue={initialSearch} />
            </div>
          ) : null}
        </div>
      </header>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        products={products}
      />
    </>
  );
}
