import Link from "next/link";
import { connection } from "next/server";
import { Search, Star, Store } from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { ProductImage } from "@/components/product-image";
import { StoreFavoriteButton } from "@/components/store-favorite-button";
import { mobileConfig } from "@/lib/mobile-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();

  const { q = "" } = await searchParams;
  const query = q.trim();

  const stores = await prisma.user
    .findMany({
      where: {
        role: "merchant",
        isActive: true,
        storeSlug: {
          not: null,
        },
        ...(query
          ? {
              OR: [
                { storeName: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
                { storeDescription: { contains: query, mode: "insensitive" } },
                { storeCity: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        storeName: true,
        storeSlug: true,
        storeDescription: true,
        storeLogo: true,
        storeBanner: true,
        storeCity: true,
        storeRating: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    })
    .catch(() => []);

  return (
    <main dir="rtl" className={mobileConfig.pageClassName}>
      <section className="mx-auto max-w-5xl px-5 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--packora-border)] pb-6">
          <div>
            <p className="text-sm text-[#6B7280]">Packora Marketplace</p>
            <h1 className="mt-2 text-3xl font-semibold">المتاجر</h1>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">
              تصفح متاجر موردي التغليف والبلاستيك داخل Packora.
            </p>
          </div>

          <Link
            href="/packora-1"
            className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold"
          >
            الرجوع للمنتجات
          </Link>
        </header>

        <form className="mt-6 flex items-center gap-3 rounded-full border border-[var(--packora-border)] bg-white px-5 py-4">
          <Search size={19} className="text-[#6B7280]" />
          <input
            name="q"
            defaultValue={query}
            placeholder="ابحث عن متجر أو مدينة..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button className="rounded-full bg-[var(--packora-navy)] px-5 py-2 text-sm font-semibold text-white">
            بحث
          </button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const name = store.storeName || store.name || "متجر مورد";
            const slug = store.storeSlug || "";
            const productCount = store._count.products;

            return (
              <article
                key={store.id}
                className="overflow-hidden rounded-[28px] border border-[var(--packora-border)] bg-white"
              >
                <div className="h-28 bg-[linear-gradient(135deg,var(--packora-blue),var(--packora-cyan))]">
                  {store.storeBanner ? (
                    <ProductImage
                      src={store.storeBanner}
                      alt={name}
                      className="h-full w-full object-cover"
                      fallbackClassName="h-full w-full bg-[linear-gradient(135deg,var(--packora-blue),var(--packora-cyan))]"
                    />
                  ) : null}
                </div>

                <div className="-mt-10 p-5">
                  <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-[var(--packora-border)] bg-white shadow-sm">
                    {store.storeLogo ? (
                      <ProductImage
                        src={store.storeLogo}
                        alt={name}
                        className="h-full w-full object-cover"
                        fallbackClassName="grid h-full w-full place-items-center text-[#9CA3AF]"
                      />
                    ) : (
                      <Store size={32} strokeWidth={1.7} />
                    )}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-xl font-semibold">
                        {name}
                      </h2>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        {store.storeCity || "متجر داخل Packora"}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1 text-sm font-semibold">
                      <Star size={15} className="text-amber-500" fill="currentColor" />
                      {store.storeRating.toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#6B7280]">
                    {store.storeDescription ||
                      "منتجات تغليف وبلاستيك متاحة للطلب من هذا المورد."}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#6B7280]">
                      {productCount} منتج
                    </span>

                    <StoreFavoriteButton
                      store={{
                        id: store.id,
                        name,
                        slug,
                        logo: store.storeLogo,
                        city: store.storeCity,
                        rating: store.storeRating,
                        productCount,
                      }}
                    />
                  </div>

                  <Link
                    href={`/store/${slug}`}
                    className="mt-5 block rounded-full bg-[var(--packora-blue)] py-3 text-center text-sm font-semibold text-white"
                  >
                    دخول المتجر
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {stores.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-[var(--packora-border)] p-10 text-center">
            <Store className="mx-auto text-[#9CA3AF]" size={44} />
            <h2 className="mt-4 text-2xl font-semibold">لا توجد متاجر</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              جرّب البحث باسم آخر أو انتظر اعتماد المتاجر الجديدة.
            </p>
          </div>
        ) : null}
      </section>
      <PackoraBottomNav active="categories" />
    </main>
  );
}
