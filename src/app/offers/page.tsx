import Link from "next/link";
import { connection } from "next/server";
import { X } from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { ProductGrid } from "@/components/product-grid";
import { prisma } from "@/lib/prisma";

export default async function OffersPage() {
  await connection();

  const products = await prisma.product.findMany({
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
    take: 20,
  });

  return (
    <main dir="rtl" className="min-h-screen bg-white pb-28 text-[#111827]">
      <section className="mx-auto max-w-md">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5">
          <Link
            href="/packora-1"
            aria-label="الرجوع للمتجر"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB]"
          >
            <X size={21} />
          </Link>

          <h1 className="text-xl font-semibold">العروض</h1>

          <span className="text-sm text-[#6B7280]">
            {products.length} منتج
          </span>
        </header>

        <section className="px-8 py-8">
          <div className="border-b border-[#E5E7EB] pb-8">
            <p className="text-sm text-[#6B7280]">Packora Offers</p>

            <h2 className="mt-2 text-[34px] font-semibold leading-tight">
              عروض التغليف والجملة
            </h2>

            <p className="mt-4 leading-8 text-[#6B7280]">
              اكتشف أحدث العروض على منتجات البلاستيك والتغليف للمطاعم
              والمتاجر.
            </p>
          </div>
        </section>

        <ProductGrid products={products} />

        <PackoraBottomNav active="home" />
      </section>
    </main>
  );
}
