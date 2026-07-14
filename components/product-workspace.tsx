"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { StampBadge } from "@/components/ui/stamp-badge";

const formatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

type StockFilter = "all" | "available" | "low";

const LOW_STOCK_THRESHOLD = 20;

type ProductWorkspaceProps = {
  products: Product[];
};

const filters: { label: string; value: StockFilter }[] = [
  { label: "الكل", value: "all" },
  { label: "متوفر", value: "available" },
  { label: "منخفض", value: "low" },
];

function escapeCsvValue(value: string | number) {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(products: Product[]) {
  const header = ["المنتج", "الوصف", "السعر", "المخزون", "الحالة"];
  const rows = products.map((product) => [
    product.name,
    product.description,
    product.price,
    product.stock,
    product.stock <= LOW_STOCK_THRESHOLD ? "منخفض" : "متوفر",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "packora-products.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ProductWorkspace({ products }: ProductWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar-SA");

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.description]
          .join(" ")
          .toLocaleLowerCase("ar-SA")
          .includes(normalizedQuery);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= LOW_STOCK_THRESHOLD) ||
        (stockFilter === "available" && product.stock > LOW_STOCK_THRESHOLD);

      return matchesQuery && matchesStock;
    });
  }, [products, query, stockFilter]);

  const lowStock = filteredProducts.filter(
    (product) => product.stock <= LOW_STOCK_THRESHOLD,
  );
  const filteredStock = filteredProducts.reduce(
    (sum, product) => sum + product.stock,
    0,
  );
  const filteredValue = filteredProducts.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="rounded-sm border border-hairline bg-paper">
        <div className="grid gap-3 border-b border-hairline px-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="font-bold">المنتجات</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {filteredProducts.length} من {products.length} منتج
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="sr-only">بحث في المنتجات</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث باسم المنتج أو الوصف"
                className="h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm outline-none transition focus:border-tape focus:ring-2 focus:ring-tape/20 sm:w-72"
              />
            </label>

            <div
              className="grid h-10 grid-cols-3 rounded-sm border border-hairline bg-kraft p-1 text-sm"
              role="group"
              aria-label="تصفية المنتجات حسب المخزون"
            >
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStockFilter(filter.value)}
                  className={`rounded-sm px-3 font-semibold transition ${
                    stockFilter === filter.value
                      ? "bg-white text-tape-deep shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => downloadCsv(filteredProducts)}
              disabled={filteredProducts.length === 0}
              className="h-10 rounded-sm bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink-soft/40"
            >
              تصدير CSV
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-hairline px-4 py-3 font-mono text-sm text-ink-soft sm:grid-cols-3">
          <span>المعروض: {filteredProducts.length}</span>
          <span>المخزون: {filteredStock}</span>
          <span>القيمة: {formatter.format(filteredValue)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-kraft text-ink-soft">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">المنتج</th>
                <th className="px-4 py-3 text-right font-semibold">الوصف</th>
                <th className="px-4 py-3 text-right font-semibold">السعر</th>
                <th className="px-4 py-3 text-right font-semibold">المخزون</th>
                <th className="px-4 py-3 text-right font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4 font-semibold">{product.name}</td>
                  <td className="max-w-md px-4 py-4 text-ink-soft">
                    {product.description}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {formatter.format(product.price)}
                  </td>
                  <td className="px-4 py-4 font-mono">{product.stock}</td>
                  <td className="px-4 py-4">
                    <StampBadge
                      label={
                        product.stock <= LOW_STOCK_THRESHOLD
                          ? "منخفض"
                          : "متوفر"
                      }
                      tone={
                        product.stock <= LOW_STOCK_THRESHOLD ? "alert" : "ok"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">
              لا توجد منتجات مطابقة للبحث الحالي.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="space-y-6">
        <section className="rounded-sm border border-hairline bg-paper p-4">
          <h3 className="font-bold">تنبيهات المخزون</h3>
          <div className="mt-4 space-y-3">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="rounded-sm border border-stamp-red-soft bg-stamp-red-soft px-3 py-2 text-sm text-stamp-red"
                >
                  {product.name}: تبقى {product.stock}
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-soft">
                لا توجد منتجات منخفضة ضمن النتائج الحالية.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-sm border border-hairline bg-paper p-4">
          <h3 className="font-bold">حالة الربط</h3>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            عند ضبط متغيرات Supabase العامة، ستقرأ اللوحة جدول المنتجات
            مباشرة. في بيئة التطوير بدون مفاتيح، تظهر بيانات تجريبية حتى يبقى
            البناء والاختبار مستقرين.
          </p>
        </section>
      </aside>
    </section>
  );
}
