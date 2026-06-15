"use client";

import Link from "next/link";
import { Heart, Store, X } from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { useFavoritesStore } from "@/store/favorites-store";

export default function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.items);
  const storeFavorites = useFavoritesStore((state) => state.storeItems);
  const total = favorites.length + storeFavorites.length;

  return (
    <main dir="rtl" className="min-h-screen bg-white pb-28 text-[#111827]">
      <section className="mx-auto min-h-screen max-w-md bg-white">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5">
          <Link
            href="/packora-1"
            aria-label="الرجوع للمتجر"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB]"
          >
            <X size={21} />
          </Link>

          <h1 className="text-xl font-semibold">المفضلة</h1>

          <span className="text-sm text-[#6B7280]">{total} عنصر</span>
        </header>

        <section className="px-6 pt-8">
          {total === 0 ? (
            <div className="grid min-h-[520px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#E5E7EB] text-5xl">
                  <Heart size={42} fill="currentColor" />
                </div>

                <h2 className="mt-6 text-[32px] font-semibold leading-tight">
                  لا توجد عناصر مفضلة
                </h2>

                <p className="mt-4 leading-8 text-[#6B7280]">
                  احفظ المنتجات أو المتاجر للرجوع إليها لاحقًا من نفس المكان.
                </p>

                <Link
                  href="/packora-1"
                  className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-semibold text-white"
                >
                  تصفح المنتجات
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8">
              {storeFavorites.length > 0 ? (
                <section>
                  <h2 className="text-lg font-semibold">المتاجر المحفوظة</h2>

                  <div className="mt-4 grid gap-3">
                    {storeFavorites.map((store) => (
                      <Link
                        key={store.id}
                        href={`/store/${store.slug}`}
                        className="flex items-center gap-4 rounded-[24px] border border-[#E5E7EB] p-4"
                      >
                        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#E5E7EB] bg-white">
                          {store.logo ? (
                            <ProductImage
                              src={store.logo}
                              alt={store.name}
                              className="h-full w-full object-cover"
                              fallbackClassName="grid h-full w-full place-items-center text-[#9CA3AF]"
                            />
                          ) : (
                            <Store size={28} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-lg font-semibold">
                            {store.name}
                          </h3>
                          <p className="mt-1 text-sm text-[#6B7280]">
                            {store.city || "متجر Packora"} ·{" "}
                            {store.productCount || 0} منتج
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {favorites.length > 0 ? (
                <section>
                  <h2 className="text-lg font-semibold">المنتجات المحفوظة</h2>

                  <div className="mt-4 grid gap-4">
                    {favorites.map((product) => (
                      <Link
                        key={product.id}
                        href={`/packora-1/products/${product.id}`}
                        className="flex items-center gap-4 border-b border-[#E5E7EB] py-5"
                      >
                        <div className="grid h-24 w-24 shrink-0 place-items-center bg-white">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain"
                            fallbackClassName="grid h-full w-full place-items-center rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] text-[#9CA3AF]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#6B7280]">
                            {product.category || "منتج"}
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-lg font-semibold">
                            {product.name}
                          </h3>

                          <p className="mt-2 font-semibold">
                            <Price
                              amount={product.price}
                              className="font-semibold text-[#111827]"
                            />
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </section>

        <PackoraBottomNav active="favorites" />
      </section>
    </main>
  );
}
