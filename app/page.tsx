import { getProducts } from "@/lib/products";

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
  const lowStock = products.filter((product) => product.stock <= 20);

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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="rounded-lg border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                <h3 className="font-bold">المنتجات</h3>
                <span className="text-sm text-stone-500">
                  {products.length} منتج
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-stone-100 text-stone-600">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">
                        المنتج
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        الوصف
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        السعر
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        المخزون
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-4 font-semibold">
                          {product.name}
                        </td>
                        <td className="max-w-md px-4 py-4 text-stone-600">
                          {product.description}
                        </td>
                        <td className="px-4 py-4">
                          {formatter.format(product.price)}
                        </td>
                        <td className="px-4 py-4">{product.stock}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              product.stock <= 20
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {product.stock <= 20 ? "منخفض" : "متوفر"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h3 className="font-bold">تنبيهات المخزون</h3>
                <div className="mt-4 space-y-3">
                  {lowStock.length > 0 ? (
                    lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800"
                      >
                        {product.name}: تبقى {product.stock}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">
                      لا توجد منتجات منخفضة المخزون.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h3 className="font-bold">حالة الربط</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  عند ضبط متغيرات Supabase العامة، ستقرأ اللوحة جدول
                  المنتجات مباشرة. في بيئة التطوير بدون مفاتيح، تظهر بيانات
                  تجريبية حتى يبقى البناء والاختبار مستقرين.
                </p>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
