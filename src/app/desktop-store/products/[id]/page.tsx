import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { ArrowRight, Package } from "lucide-react";
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
    "تفاصيل المنتج والسعر والكمية في نسخة الديسكتوب. هذه الصفحة تعمل حتى عند فتح رابط تجريبي مثل /desktop-store/products/1.";
  const price = product?.price ?? 25;
  const stock = product?.stock ?? 100;

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F9FB] text-[#070B2A]">
      <header className="border-b border-[var(--packora-border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <PackoraLogo href="/desktop-store" size="desktop" />

          <Link
            href="/desktop-store"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold text-[#070B2A] transition hover:border-[var(--packora-orange)] hover:bg-[#FFF7ED]"
          >
            <ArrowRight size={17} />
            رجوع للمتجر
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-[0.9fr_1.1fr] gap-8 px-8 py-10">
        <div className="grid min-h-[560px] place-items-center rounded-[36px] border border-[var(--packora-border)] bg-white shadow-sm">
          {product ? (
            <ProductImage
              src={product.image}
              alt={product.name}
              priority
              className="h-full max-h-[560px] w-full object-contain p-10"
              fallbackClassName="grid h-full min-h-[480px] w-full place-items-center text-[#64748B]"
            />
          ) : (
            <Image
              src="/placeholder.png"
              alt="منتج"
              width={224}
              height={224}
              className="h-56 w-56 object-contain"
            />
          )}
        </div>

        <section className="rounded-[36px] border border-[var(--packora-border)] bg-white p-9 shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--packora-cyan)] text-[var(--packora-orange)]">
            <Package size={26} />
          </div>

          <p className="mt-8 text-sm font-semibold text-[var(--packora-blue)]">
            {category}
          </p>

          <h1 className="mt-3 text-5xl font-semibold leading-tight">
            {name}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#64748B]">
            {description}
          </p>

          <div className="mt-9 grid grid-cols-2 gap-4">
            <div className="rounded-[24px] border border-[var(--packora-border)] p-5">
              <p className="text-sm font-semibold text-[#64748B]">السعر</p>

              <div className="mt-2">
                <Price
                  amount={price}
                  className="text-4xl font-semibold text-[var(--packora-blue)]"
                  iconClassName="h-7 w-7"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--packora-border)] p-5">
              <p className="text-sm font-semibold text-[#64748B]">المخزون</p>
              <strong className="mt-2 block text-4xl font-semibold">
                {stock}
              </strong>
            </div>
          </div>

          <button className="mt-9 rounded-2xl bg-[var(--packora-blue)] px-8 py-4 font-black text-white transition hover:bg-[var(--packora-blue-dark)]">
            إضافة للسلة
          </button>

          <div className="mt-9 rounded-[28px] bg-[var(--packora-cyan-soft)] p-6">
            <h2 className="text-xl font-semibold">ملاحظة</h2>
            <p className="mt-3 leading-8 text-[#64748B]">
              واجهة الديسكتوب مستقلة للعرض، وإدارة المنتجات تتم من لوحة التحكم.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
