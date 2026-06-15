import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Package, ShoppingCart } from "lucide-react";
import { DesktopAddToCart } from "@/components/desktop-add-to-cart";
import { PackoraLogo } from "@/components/packora-logo";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { prisma } from "@/lib/prisma";

export default async function DesktopProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const product = await prisma.product
    .findFirst({
      where: {
        id,
        isActive: true,
        user: {
          is: {
            isActive: true,
          },
        },
      },
    })
    .catch(() => null);

  const name = product?.name ?? "تفاصيل المنتج";
  const category = product?.category ?? "منتج Packora";
  const description =
    product?.description ??
    "منتج من كتالوج Packora لمنتجات البلاستيك والتغليف. اختر الكمية وأضفه إلى سلة الديسكتوب المستقلة.";
  const price = product?.price ?? 25;
  const stock = product?.stock ?? 100;

  return (
    <main dir="rtl" className="min-h-screen bg-[#EAFBFF] text-[#070B2A]">
      <header className="sticky top-0 z-50 border-b border-[var(--packora-border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <PackoraLogo href="/desktop-store" size="desktop" />

          <div className="flex items-center gap-2">
            <Link
              href="/desktop-store/cart"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--packora-blue)] px-5 text-sm font-semibold text-white"
            >
              <ShoppingCart size={17} />
              السلة
            </Link>

            <Link
              href="/desktop-store"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--packora-border)] bg-white px-5 text-sm font-semibold text-[#070B2A] transition hover:border-[var(--packora-orange)] hover:bg-[#FFF7ED]"
            >
              <ArrowRight size={17} />
              رجوع للمتجر
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid min-h-[520px] place-items-center rounded-[28px] border border-[var(--packora-border)] bg-white shadow-sm">
          <ProductImage
            src={product?.image}
            alt={name}
            priority
            className="h-full max-h-[520px] w-full object-contain p-8"
            fallbackClassName="grid h-full min-h-[420px] w-full place-items-center text-[#64748B]"
          />
        </div>

        <section className="rounded-[28px] border border-[var(--packora-border)] bg-white p-6 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--packora-cyan)] text-[var(--packora-orange)]">
            <Package size={24} />
          </div>

          <p className="mt-6 text-sm font-semibold text-[var(--packora-blue)]">
            {category}
          </p>

          <h1 className="mt-2 text-4xl font-semibold leading-tight">{name}</h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#64748B]">
            {description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-[var(--packora-border)] p-4">
              <p className="text-sm font-semibold text-[#64748B]">السعر</p>
              <div className="mt-2">
                <Price
                  amount={price}
                  className="text-3xl font-semibold text-[var(--packora-blue)]"
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--packora-border)] p-4">
              <p className="text-sm font-semibold text-[#64748B]">المخزون</p>
              <strong className="mt-2 block text-3xl font-semibold">
                {stock}
              </strong>
            </div>
          </div>

          <DesktopAddToCart
            product={{
              id,
              name,
              category,
              image: product?.image ?? null,
              price,
            }}
          />

          <div className="mt-6 rounded-[24px] bg-[var(--packora-cyan-soft)] p-5">
            <h2 className="text-lg font-semibold">تجربة ديسكتوب مستقلة</h2>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              المنتجات والسلة هنا لا ترتبط بأيقونات واجهة العميل، ويتم التحكم
              في المنتجات من لوحة التاجر فقط.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
