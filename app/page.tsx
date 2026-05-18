import { getProducts } from "@/lib/products";
import { ProductWorkspace } from "./product-workspace";

export const dynamic = "force-dynamic";

const formatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const navigationItems = [
  "الرئيسية",
  "الطلبات",
  "المنتجات",
  "المخزون",
  "الفواتير",
  "التقارير",
];

const operations = [
  { label: "طلبات اليوم", value: "84", tone: "border-cyan-500" },
  { label: "قيد التجهيز", value: "17", tone: "border-amber-500" },
  { label: "جاهزة للشحن", value: "31", tone: "border-emerald-500" },
  { label: "تنبيهات مخزون", value: "6", tone: "border-rose-500" },
];

export default async function HomePage() {
  const products = await getProducts();
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );

  return (
    <main dir="rtl" className="min-h-screen bg-stone-50 text-stone-950">
      <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
        <aside className="border-b border-stone-200 bg-white px-5 py-5 lg:border-b-0 lg:border-l">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Packora</p>
              <h1 className="text-2xl font-bold">لوحة التشغيل</h1>
            </div>
            <div className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-600 lg:mt-6">
              إصدار مباشر
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto lg:block lg:space-y-1">
            {navigationItems.map((item, index) => (
              <a
                key={item}
                href="#"
                className={`block shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                  index === 0
                    ? "bg-stone-950 text-white"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-700">
                إدارة الطلبات والتغليف
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal">
                متابعة المخزون والمنتجات من مكان واحد
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
              <span className="rounded-md border border-stone-200 bg-white px-3 py-2">
                المخزون: {totalStock}
              </span>
              <span className="rounded-md border border-stone-200 bg-white px-3 py-2">
                القيمة: {formatter.format(inventoryValue)}
              </span>
            </div>
          </header>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operations.map((item) => (
              <article
                key={item.label}
                className={`rounded-lg border bg-white p-4 ${item.tone}`}
              >
                <p className="text-sm text-stone-600">{item.label}</p>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
              </article>
            ))}
          </section>

          <ProductWorkspace products={products} />
        </section>
      </div>
    </main>
  );
}
