import Link from "next/link";
import { connection } from "next/server";
import {
  Clock,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Star,
  Store,
  X,
} from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { StoreFavoriteButton } from "@/components/store-favorite-button";
import { mobileConfig } from "@/lib/mobile-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeWhatsApp(phone?: string | null) {
  const digits = (phone || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("966")) {
    return digits;
  }

  if (digits.startsWith("05")) {
    return `966${digits.slice(1)}`;
  }

  if (digits.startsWith("5")) {
    return `966${digits}`;
  }

  return digits;
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;

  const merchant = await prisma.user
    .findFirst({
      where: {
        storeSlug: slug,
        role: "merchant",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        storeName: true,
        storeSlug: true,
        storeDescription: true,
        storeLogo: true,
        storeBanner: true,
        storeWhatsapp: true,
        storeCity: true,
        storeHours: true,
        storeRating: true,
        storeRatingCount: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
        products: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 48,
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            image: true,
            rating: true,
          },
        },
      },
    })
    .catch(() => null);

  if (!merchant) {
    return (
      <main className="grid min-h-screen place-items-center bg-white p-6">
        <div className="rounded-[28px] border border-[var(--packora-border)] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--packora-navy)]">
            المتجر غير موجود
          </h1>

          <Link
            href="/packora-1"
            className="mt-5 inline-block rounded-full bg-[var(--packora-navy)] px-6 py-3 font-semibold text-white"
          >
            الرجوع للمتجر
          </Link>
        </div>
      </main>
    );
  }

  const storeName = merchant.storeName || merchant.name || "متجر مورد";
  const whatsapp = normalizeWhatsApp(merchant.storeWhatsapp);
  const productCount = merchant._count.products;

  return (
    <main dir="rtl" className={mobileConfig.pageClassName}>
      <section className="mx-auto max-w-5xl bg-white">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--packora-border)] bg-white px-5 py-4">
          <Link
            href="/packora-1"
            aria-label="الرجوع للمتجر"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--packora-border)]"
          >
            <X size={21} />
          </Link>

          <h1 className="line-clamp-1 text-lg font-semibold">{storeName}</h1>

          <Link
            href="/packora-1/cart"
            aria-label="السلة"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--packora-border)]"
          >
            <ShoppingCart size={20} />
          </Link>
        </header>

        <section className="px-5 py-6">
          <div className="overflow-hidden rounded-[34px] border border-[var(--packora-border)] bg-white">
            <div className="h-44 bg-[linear-gradient(135deg,var(--packora-blue),var(--packora-cyan))] md:h-60">
              {merchant.storeBanner ? (
                <ProductImage
                  src={merchant.storeBanner}
                  alt={storeName}
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full bg-[linear-gradient(135deg,var(--packora-blue),var(--packora-cyan))]"
                  priority
                />
              ) : null}
            </div>

            <div className="-mt-12 px-6 pb-6">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-[var(--packora-border)] bg-white shadow-sm">
                {merchant.storeLogo ? (
                  <ProductImage
                    src={merchant.storeLogo}
                    alt={storeName}
                    className="h-full w-full object-cover"
                    fallbackClassName="grid h-full w-full place-items-center text-[#9CA3AF]"
                  />
                ) : (
                  <Store size={38} strokeWidth={1.7} />
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                    Packora Store
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold">{storeName}</h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
                    <span className="inline-flex items-center gap-1">
                      <Star size={16} className="text-amber-500" fill="currentColor" />
                      {merchant.storeRating.toFixed(1)}
                      <span>({merchant.storeRatingCount})</span>
                    </span>

                    {merchant.storeCity ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={16} />
                        {merchant.storeCity}
                      </span>
                    ) : null}

                    {merchant.storeHours ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={16} />
                        {merchant.storeHours}
                      </span>
                    ) : null}
                  </div>
                </div>

                <StoreFavoriteButton
                  store={{
                    id: merchant.id,
                    name: storeName,
                    slug: merchant.storeSlug || slug,
                    logo: merchant.storeLogo,
                    city: merchant.storeCity,
                    rating: merchant.storeRating,
                    productCount,
                  }}
                />
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280]">
                {merchant.storeDescription ||
                  "منتجات تغليف وبلاستيك متاحة للطلب من هذا المورد داخل Packora."}
              </p>

              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `مرحبًا، أريد الاستفسار عن منتجات ${storeName} في Packora`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle size={18} />
                  تواصل واتساب
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <section className="rounded-[26px] border border-[var(--packora-border)] bg-white p-5">
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                التواصل
              </p>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                {whatsapp
                  ? "يمكنك التواصل مع المتجر مباشرة عبر واتساب للاستفسارات قبل الطلب."
                  : "التواصل يتم عبر طلبات Packora حتى يضيف المتجر رقم واتساب."}
              </p>
            </section>

            <section className="rounded-[26px] border border-[var(--packora-border)] bg-white p-5">
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                سياسة الطلب
              </p>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                يتم تجهيز الطلبات حسب توفر المخزون، وتظهر حالة الطلب في صفحة التتبع.
              </p>
            </section>

            <section className="rounded-[26px] border border-[var(--packora-border)] bg-white p-5">
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                الاسترجاع
              </p>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                تتم مراجعة طلبات الاسترجاع أو الاستبدال حسب حالة المنتج وسياسة المورد.
              </p>
            </section>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">منتجات المتجر</h2>

            <span className="text-sm font-semibold text-[#6B7280]">
              {productCount} منتج
            </span>
          </div>

          {productCount === 0 ? (
            <div className="mt-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-8 text-center">
              <h3 className="text-2xl font-semibold">لا توجد منتجات حالياً</h3>

              <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                ستظهر منتجات هذا المتجر بعد إضافتها من لوحة التاجر.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {merchant.products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[26px] border border-[var(--packora-border)] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link href={`/packora-1/products/${product.id}`}>
                    <div className="grid h-44 place-items-center overflow-hidden bg-white">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-5"
                        fallbackClassName="grid h-full w-full place-items-center text-[#9CA3AF]"
                      />
                    </div>
                  </Link>

                  <div className="border-t border-[var(--packora-border)] p-4">
                    <p className="text-[11px] font-semibold text-[#9CA3AF]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-[42px] text-sm font-semibold leading-5">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Price
                        amount={product.price}
                        className="text-sm font-semibold text-[var(--packora-blue)]"
                      />

                      <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                        <Star size={13} className="text-amber-500" fill="currentColor" />
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
      <PackoraBottomNav active="categories" />
    </main>
  );
}
