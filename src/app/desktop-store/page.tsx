import Link from "next/link";
import { connection } from "next/server";
import { Filter, Search, ShoppingCart } from "lucide-react";
import { PackoraLogo } from "@/components/packora-logo";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { prisma } from "@/lib/prisma";

export default async function DesktopStorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await connection();

  const { category, q } = await searchParams;
  const products = await prisma.product
    .findMany({
      where: {
        isActive: true,
        user: {
          is: {
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    .catch(() => []);

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  );
  const query = (q || "").trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return (
    <main dir="rtl" className="min-h-screen bg-[#EAFBFF] text-[#070B2A]">
      <header className="sticky top-0 z-50 border-b border-[var(--packora-border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-3">
          <PackoraLogo href="/desktop-store" size="desktop" />

          <form
            action="/desktop-store"
            className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-[var(--packora-border)] bg-[#F8FCFF] px-4"
          >
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <Search size={17} className="text-[var(--packora-blue)]" />
            <input
              name="q"
              defaultValue={q || ""}
              placeholder="ابحث عن منتج في الديسكتوب"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
            />
          </form>

          <Link
            href="/desktop-store/cart"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--packora-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--packora-blue-dark)]"
          >
            <ShoppingCart size={17} />
            السلة
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <section className="rounded-[28px] bg-gradient-to-l from-[var(--packora-blue)] via-[#3B82F6] to-[#4FE7C5] p-6 text-white shadow-[0_20px_50px_rgba(47,101,230,0.20)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold opacity-90">واجهة ديسكتوب مستقلة</p>
              <h1 className="mt-2 text-3xl font-semibold">
                منتجات البلاستيك والتغليف
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 opacity-90">
                المنتجات تدار من لوحة التحكم، وتظهر هنا بتجربة مستقلة وسريعة.
              </p>
            </div>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              {filteredProducts.length} منتج
            </span>
          </div>
        </section>

        <section
          id="categories"
          className="mt-5 rounded-[24px] border border-[var(--packora-border)] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">التصنيفات</h2>
            <Filter size={18} className="text-[#64748B]" />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/desktop-store"
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                !category
                  ? "bg-[var(--packora-blue)] text-white"
                  : "border border-[var(--packora-border)] bg-white text-[#334155]"
              }`}
            >
              جميع المنتجات
            </Link>

            {categories.map((item) => (
              <Link
                key={item}
                href={`/desktop-store?category=${encodeURIComponent(item)}`}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                  category === item
                    ? "bg-[var(--packora-blue)] text-white"
                    : "border border-[var(--packora-border)] bg-white text-[#334155]"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <section className="mt-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-12 text-center">
            <h2 className="text-2xl font-semibold">لا توجد منتجات حالياً</h2>
            <p className="mt-3 text-[#64748B]">
              أضف المنتجات من لوحة التحكم حتى تظهر في واجهة الديسكتوب.
            </p>
          </section>
        ) : (
          <section
            id="products"
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
          >
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/desktop-store/products/${product.id}`}
                className="group overflow-hidden rounded-2xl border border-[var(--packora-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(7,11,42,0.10)]"
              >
                <div className="grid h-36 place-items-center bg-white sm:h-40">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-3 transition group-hover:scale-[1.03]"
                    fallbackClassName="grid h-full w-full place-items-center bg-[#F8FAFC] text-[#64748B]"
                  />
                </div>

                <div className="border-t border-[#EEF2F7] p-3">
                  <p className="line-clamp-1 text-[11px] font-semibold text-[var(--packora-orange)]">
                    {product.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Price
                      amount={product.price}
                      className="text-sm font-semibold text-[var(--packora-blue)]"
                    />
                    <span className="rounded-full bg-[#F8FAFC] px-2 py-1 text-[10px] font-semibold text-[#64748B]">
                      {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
