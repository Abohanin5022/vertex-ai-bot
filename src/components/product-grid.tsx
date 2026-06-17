"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  Flame,
  History,
  Package,
  SearchX,
  Star,
  TrendingUp,
} from "lucide-react";
import { PackoraProductCard } from "@/components/packora-product-card";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string | null;
};

const allCategory = "الكل";
const offersCategory = "العروض";
const packagingCategory = "packaging";

const smartSections = [
  { label: "العروض اليومية", href: "/offers", icon: Flame },
  { label: "الأكثر طلبًا", href: "/packora-1?sort=popular", icon: TrendingUp },
  { label: "الأعلى تقييمًا", href: "/packora-1?sort=rating", icon: Star },
  { label: "منتجات سابقة", href: "/packora-1", icon: History },
];

const fallbackCategories = [
  "علب",
  "أكواب",
  "صحون",
  "أكياس",
  "كراتين",
  "تغليف",
];

export function ProductGrid({ products }: { products: Product[] }) {
  const urlSearch = useSyncExternalStore(
    subscribeToUrlChanges,
    getUrlSearch,
    getServerUrlSearch
  );
  const searchParams = useMemo(() => new URLSearchParams(urlSearch), [urlSearch]);
  const categoryFromUrl = searchParams.get("category") || allCategory;
  const queryFromUrl = searchParams.get("q") || "";
  const isPackagingCategory = categoryFromUrl === packagingCategory;
  const categoryLabel = isPackagingCategory
    ? "التغليف والبلاستيك"
    : categoryFromUrl;

  const categories = useMemo(() => {
    const realCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );

    return realCategories.length ? realCategories.slice(0, 10) : fallbackCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = queryFromUrl.trim().toLowerCase();

    return products.filter((product) => {
      const category = product.category || "";
      const matchCategory =
        categoryFromUrl === allCategory ||
        categoryFromUrl === offersCategory ||
        isPackagingCategory ||
        category.includes(categoryFromUrl);

      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [products, queryFromUrl, categoryFromUrl, isPackagingCategory]);

  return (
    <>
      <section className="px-4 pb-5 pt-3 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[var(--packora-border)] bg-white p-4 shadow-[0_16px_36px_rgba(236,72,153,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--packora-blue)]">
                Packora Store
              </p>
              <h2 className="mt-1 text-xl font-black text-[var(--packora-navy)]">
                أقسام المنتجات
              </h2>
            </div>

            <span className="rounded-full bg-[var(--packora-light-pink)] px-3 py-1 text-xs font-bold text-[var(--packora-blue)]">
              {filteredProducts.length} منتج
            </span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {smartSections.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] px-4 py-2 text-xs font-bold text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-light-pink)]"
                >
                  <Icon size={15} className="text-[var(--packora-blue)]" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <CategoryPill
              label="الكل"
              href="/packora-1"
              active={categoryFromUrl === allCategory}
            />
            {categories.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                href={`/packora-1?category=${encodeURIComponent(category)}`}
                active={categoryFromUrl === category}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--packora-navy)]">
              {categoryLabel === allCategory ? "المنتجات المتاحة" : categoryLabel}
            </h2>
            <p className="mt-1 text-sm text-[var(--packora-muted)]">
              اختر منتجات التغليف والبلاستيك المناسبة لطلبك.
            </p>
            {queryFromUrl ? (
              <p className="mt-1 text-xs font-semibold text-[var(--packora-blue)]">
                نتائج البحث عن: {queryFromUrl}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[var(--packora-border)] bg-white px-6 py-14 text-center shadow-[0_16px_36px_rgba(236,72,153,0.07)]">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
              <SearchX size={30} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[var(--packora-navy)]">
              لا توجد منتجات حاليًا
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[var(--packora-muted)]">
              جرّب تصنيفًا آخر أو أضف منتجات حقيقية من لوحة التاجر لتظهر هنا.
            </p>
          </div>
        </section>
      ) : (
        <section
          id="products"
          className="grid grid-cols-2 gap-3 px-3 pb-28 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8 xl:grid-cols-6"
        >
          {filteredProducts.map((product) => (
            <PackoraProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </>
  );
}

function CategoryPill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-[var(--packora-blue)] bg-[var(--packora-blue)] text-white shadow-[0_10px_22px_rgba(236,72,153,0.18)]"
          : "border-[var(--packora-border)] bg-white text-[var(--packora-navy)] hover:border-[var(--packora-blue)] hover:bg-[var(--packora-light-pink)]"
      }`}
    >
      <Package size={16} />
      {label}
    </Link>
  );
}

function subscribeToUrlChanges(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getUrlSearch() {
  return window.location.search;
}

function getServerUrlSearch() {
  return "";
}
