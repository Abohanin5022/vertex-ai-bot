"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Flame, History, Package, Star, TrendingUp } from "lucide-react";
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
  { label: "المنتجات السابقة", href: "/packora-1", icon: History },
  { label: "الأعلى تقييمًا", href: "/packora-1?sort=rating", icon: Star },
  { label: "الأكثر طلبًا", href: "/packora-1?sort=popular", icon: TrendingUp },
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

    return realCategories.length ? realCategories.slice(0, 8) : fallbackCategories;
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
      <section className="space-y-4 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {smartSections.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--packora-border)] bg-white px-3 py-2 text-xs font-semibold text-[#334155] shadow-sm"
              >
                <Icon size={15} className="text-[var(--packora-orange)]" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          <CategoryCard label="الكل" href="/packora-1" active={categoryFromUrl === allCategory} />
          {categories.slice(0, 7).map((category) => (
            <CategoryCard
              key={category}
              label={category}
              href={`/packora-1?category=${encodeURIComponent(category)}`}
              active={categoryFromUrl === category}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">
              {categoryLabel === allCategory ? "المنتجات" : categoryLabel}
            </h2>
            {queryFromUrl ? (
              <p className="mt-0.5 text-xs text-[#64748B]">
                نتائج البحث عن: {queryFromUrl}
              </p>
            ) : null}
          </div>

          <span className="rounded-full bg-[#F1F8FF] px-3 py-1 text-xs font-semibold text-[var(--packora-blue)]">
            {filteredProducts.length} منتج
          </span>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="px-8 py-20 text-center">
          <h2 className="text-2xl font-semibold">لا توجد منتجات حالياً</h2>
          <p className="mt-3 text-base leading-8 text-[#6B7280]">
            أضف منتجات حقيقية من لوحة التاجر لتظهر هنا.
          </p>
        </section>
      ) : (
        <section
          id="products"
          className="grid grid-cols-2 gap-2.5 px-3 pb-28 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
        >
          {filteredProducts.map((product) => (
            <PackoraProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </>
  );
}

function CategoryCard({
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
      className={`grid h-[92px] place-items-center rounded-2xl border p-2 text-center transition ${
        active
          ? "border-[var(--packora-blue)] bg-[#EAF4FF]"
          : "border-[var(--packora-border)] bg-white"
      }`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          active
            ? "bg-[var(--packora-blue)] text-white"
            : "bg-[#F4FCFF] text-[var(--packora-orange)]"
        }`}
      >
        <Package size={18} />
      </span>
      <span className="line-clamp-2 text-[11px] font-semibold leading-4 text-[#334155]">
        {label}
      </span>
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
