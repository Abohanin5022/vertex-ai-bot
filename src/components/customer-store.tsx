"use client";

import { useMemo, useState } from "react";
import { Camera, Search } from "lucide-react";
import { ProductCard, type CustomerProduct } from "@/components/product-card";

const categories = [
  "الكل",
  "العروض",
  "صحون",
  "علب",
  "أكواب",
  "أكياس",
  "ملاعق",
  "كراتين",
  "تغليف",
];

type Props = {
  products: CustomerProduct[];
  initialCategory?: string;
  initialSearch?: string;
};

export function CustomerStore({
  products,
  initialCategory = "الكل",
  initialSearch = "",
}: Props) {
  const safeInitialCategory = categories.includes(initialCategory)
    ? initialCategory
    : "الكل";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(safeInitialCategory);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const productName = product.name.toLowerCase();
      const productCategory = product.category.toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        productName.includes(normalizedSearch) ||
        productCategory.includes(normalizedSearch);

      const matchCategory =
        category === "الكل" || product.category.includes(category);

      return matchSearch && matchCategory;
    });
  }, [products, search, category]);

  const suggestions = search.trim() ? filteredProducts.slice(0, 3) : [];

  return (
    <>
      <div className="mt-3 rounded-2xl border border-[#FED7AA] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-[#F97316]">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج أو تصنيف..."
            className="w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8]"
          />

          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-xs font-black text-[#EA580C]"
            >
              مسح
            </button>
          ) : (
            <Camera size={18} />
          )}
        </div>

        {suggestions.length > 0 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSearch(product.name)}
                className="whitespace-nowrap rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-xs font-bold text-[#EA580C]"
              >
                {product.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-black ${
              category === item
                ? "border-[#F97316] bg-[#F97316] text-white"
                : "border-[#FED7AA] bg-white text-[#64748B]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-lg font-black text-[#1F2937]">المنتجات</h3>

        <span className="text-xs font-black text-[#2563EB]">
          {filteredProducts.length} منتج
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#FED7AA] bg-white p-8 text-center text-[#1F2937]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#FED7AA] text-[#F97316]">
            <Search size={36} strokeWidth={1.7} />
          </div>
          <h3 className="mt-4 text-xl font-black">لا توجد نتائج</h3>
          <p className="mt-2 text-sm font-bold text-[#64748B]">
            جرّب البحث باسم آخر أو اختر تصنيف مختلف.
          </p>
        </div>
      ) : (
        <section id="products" className="mt-4 grid grid-cols-2 gap-3 pb-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </>
  );
}
