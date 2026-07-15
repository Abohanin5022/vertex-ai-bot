import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getFetchMetrics, average } from "@/lib/metrics-store";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { StampBadge } from "@/components/ui/stamp-badge";
import { InventoryAnalytics } from "@/components/inventory-analytics";

export const dynamic = "force-dynamic";

const formatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const LOW_STOCK_THRESHOLD = 20;

export default async function HomePage() {
  const products = await getProducts();
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );
  const lowStockProducts = products.filter(
    (product) => product.stock <= LOW_STOCK_THRESHOLD,
  );

  const fetchMetrics = getFetchMetrics();
  const avgLatency = average(fetchMetrics.map((entry) => entry.durationMs));
  const lastMetric = fetchMetrics[fetchMetrics.length - 1];

  const stats = [
    { label: "إجمالي المنتجات", value: String(products.length) },
    { label: "إجمالي المخزون", value: String(totalStock) },
    { label: "قيمة المخزون", value: formatter.format(inventoryValue) },
    { label: "تنبيهات مخزون", value: String(lowStockProducts.length) },
  ];

  return (
    <div>
      <header className="pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-tape-deep">
          نظرة عامة
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal">
          متابعة المخزون والمنتجات من مكان واحد
        </h2>
      </header>

      <PerforatedDivider />

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-sm border border-hairline bg-paper p-4"
          >
            <p className="text-sm text-ink-soft">{item.label}</p>
            <p className="mt-3 font-mono text-3xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-sm border border-hairline bg-paper p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">تنبيهات مخزون منخفض</h3>
            <Link
              href="/products"
              className="text-sm font-semibold text-tape-deep hover:underline"
            >
              عرض كل المنتجات ←
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-sm border border-hairline px-3 py-2 text-sm"
                >
                  <span>{product.name}</span>
                  <StampBadge label={`تبقى ${product.stock}`} tone="alert" />
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-soft">
                لا توجد منتجات منخفضة المخزون حاليًا.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-sm border border-hairline bg-paper p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">نبض التطبيق</h3>
            <Link
              href="/performance"
              className="text-sm font-semibold text-tape-deep hover:underline"
            >
              التفاصيل ←
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            آخر زمن استجابة لجلب بيانات المنتجات:
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {lastMetric ? `${lastMetric.durationMs.toFixed(0)} ms` : "—"}
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            المتوسط على آخر {fetchMetrics.length} طلب:{" "}
            <span className="font-mono font-semibold text-ink">
              {avgLatency ? `${avgLatency.toFixed(0)} ms` : "—"}
            </span>
          </p>
        </div>
      </section>

      <InventoryAnalytics products={products} />
    </div>
  );
}
