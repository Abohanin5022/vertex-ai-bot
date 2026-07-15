import type { Product } from "@/lib/products";

const LOW_STOCK_THRESHOLD = 20;

const currencyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

function TopProductsByValue({ products }: { products: Product[] }) {
  const ranked = [...products]
    .map((product) => ({
      ...product,
      value: product.price * product.stock,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const maxValue = Math.max(...ranked.map((product) => product.value), 1);

  return (
    <div className="rounded-sm border border-hairline bg-paper p-4">
      <h3 className="font-bold">أعلى المنتجات قيمةً</h3>
      <p className="mt-1 text-sm text-ink-soft">السعر × المخزون الحالي</p>

      {ranked.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">لا توجد منتجات بعد.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {ranked.map((product) => (
            <div key={product.id}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{product.name}</span>
                <span className="shrink-0 font-mono text-ink-soft">
                  {currencyFormatter.format(product.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-kraft">
                <div
                  className="h-full rounded-full bg-tape"
                  style={{
                    width: `${Math.max((product.value / maxValue) * 100, 3)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockStatusSplit({ products }: { products: Product[] }) {
  const total = products.length;
  const lowCount = products.filter(
    (product) => product.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const availableCount = total - lowCount;
  const lowPercent = total === 0 ? 0 : Math.round((lowCount / total) * 100);
  const availablePercent = total === 0 ? 0 : 100 - lowPercent;

  return (
    <div className="rounded-sm border border-hairline bg-paper p-4">
      <h3 className="font-bold">توزيع حالة المخزون</h3>
      <p className="mt-1 text-sm text-ink-soft">
        نسبة المنتجات المتوفرة مقابل منخفضة المخزون
      </p>

      {total === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">لا توجد منتجات بعد.</p>
      ) : (
        <>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full">
            <div
              className="bg-manifest-cyan"
              style={{ width: `${availablePercent}%` }}
              title={`متوفر: ${availableCount}`}
            />
            <div
              className="bg-stamp-red"
              style={{ width: `${lowPercent}%` }}
              title={`منخفض: ${lowCount}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-manifest-cyan" />
              متوفر — {availableCount} ({availablePercent}٪)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-stamp-red" />
              منخفض — {lowCount} ({lowPercent}٪)
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function InventoryAnalytics({ products }: { products: Product[] }) {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      <TopProductsByValue products={products} />
      <StockStatusSplit products={products} />
    </section>
  );
}
