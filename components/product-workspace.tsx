"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { StampBadge } from "@/components/ui/stamp-badge";
import { ProductFormModal } from "@/components/product-form-modal";

const formatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

type StockFilter = "all" | "available" | "low";
type SortKey = "name" | "price" | "stock";
type SortDirection = "asc" | "desc";

const LOW_STOCK_THRESHOLD = 20;

type ProductWorkspaceProps = {
  products: Product[];
  isSupabaseConfigured: boolean;
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

function sortIndicator(
  key: SortKey,
  sort: { key: SortKey; direction: SortDirection } | null,
) {
  if (!sort || sort.key !== key) {
    return null;
  }

  return sort.direction === "asc" ? "▲" : "▼";
}

export function ProductWorkspace({
  products,
  isSupabaseConfigured,
}: ProductWorkspaceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);
  const [formTarget, setFormTarget] = useState<
    { mode: "create" } | { mode: "edit"; product: Product } | null
  >(null);
  const [deletingId, setDeletingId] = useState<Product["id"] | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`تأكيد حذف "${product.name}"؟`)) {
      return;
    }

    setDeleteError(null);
    setDeletingId(product.id);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setDeleteError(data?.error || "تعذر حذف المنتج.");
        return;
      }

      router.refresh();
    } catch {
      setDeleteError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setDeletingId(null);
    }
  }

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

  const sortedProducts = useMemo(() => {
    if (!sort) {
      return filteredProducts;
    }

    const direction = sort.direction === "asc" ? 1 : -1;

    return [...filteredProducts].sort((a, b) => {
      if (sort.key === "name") {
        return a.name.localeCompare(b.name, "ar") * direction;
      }

      return (a[sort.key] - b[sort.key]) * direction;
    });
  }, [filteredProducts, sort]);

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
              onClick={() => downloadCsv(sortedProducts)}
              disabled={sortedProducts.length === 0}
              className="h-10 rounded-sm bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink-soft/40"
            >
              تصدير CSV
            </button>

            <button
              type="button"
              onClick={() => setFormTarget({ mode: "create" })}
              disabled={!isSupabaseConfigured}
              title={
                isSupabaseConfigured
                  ? undefined
                  : "اربط Supabase أولًا لإضافة منتجات جديدة"
              }
              className="h-10 rounded-sm border border-tape-deep px-4 text-sm font-semibold text-tape-deep transition hover:bg-tape-deep/10 disabled:cursor-not-allowed disabled:border-hairline disabled:text-ink-soft/60"
            >
              + إضافة منتج
            </button>
          </div>
        </div>

        {!isSupabaseConfigured ? (
          <p className="border-b border-hairline bg-kraft px-4 py-2 text-sm text-ink-soft">
            اللوحة تعرض بيانات تجريبية حاليًا (Supabase غير مربوط) — الإضافة
            والتعديل والحذف معطّلة إلى أن يتم الربط.
          </p>
        ) : null}

        {deleteError ? (
          <p className="border-b border-hairline bg-stamp-red-soft px-4 py-2 text-sm text-stamp-red">
            {deleteError}
          </p>
        ) : null}

        <div className="grid gap-3 border-b border-hairline px-4 py-3 font-mono text-sm text-ink-soft sm:grid-cols-3">
          <span>المعروض: {filteredProducts.length}</span>
          <span>المخزون: {filteredStock}</span>
          <span>القيمة: {formatter.format(filteredValue)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-kraft text-ink-soft">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1 transition hover:text-ink"
                  >
                    المنتج
                    <span className="text-[10px]">
                      {sortIndicator("name", sort)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">الوصف</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("price")}
                    className="inline-flex items-center gap-1 transition hover:text-ink"
                  >
                    السعر
                    <span className="text-[10px]">
                      {sortIndicator("price", sort)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("stock")}
                    className="inline-flex items-center gap-1 transition hover:text-ink"
                  >
                    المخزون
                    <span className="text-[10px]">
                      {sortIndicator("stock", sort)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {sortedProducts.map((product) => (
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
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormTarget({ mode: "edit", product })
                        }
                        disabled={!isSupabaseConfigured}
                        className="rounded-sm border border-hairline px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:bg-kraft-deep/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={
                          !isSupabaseConfigured || deletingId === product.id
                        }
                        className="rounded-sm border border-stamp-red-soft px-2.5 py-1 text-xs font-semibold text-stamp-red transition hover:bg-stamp-red-soft disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === product.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedProducts.length === 0 ? (
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

      {formTarget ? (
        <ProductFormModal
          product={formTarget.mode === "edit" ? formTarget.product : undefined}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            router.refresh();
          }}
        />
      ) : null}
    </section>
  );
}
