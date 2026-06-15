import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ChevronLeft, Store, X } from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { prisma } from "@/lib/prisma";

export default async function VendorsPage() {
  await connection();

  const vendors = await prisma.user.findMany({
    where: {
      role: "merchant",
      isActive: true,
      storeSlug: {
        not: null,
      },
    },
    include: {
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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

          <h1 className="text-xl font-semibold">الموردين</h1>

          <span className="text-sm text-[#6B7280]">{vendors.length} مورد</span>
        </header>

        <section className="px-8 py-8">
          <div className="border-b border-[#E5E7EB] pb-8">
            <p className="text-sm text-[#6B7280]">Packora Vendors</p>

            <h2 className="mt-2 text-[34px] font-semibold leading-tight">
              موردو التغليف والبلاستيك
            </h2>

            <p className="mt-4 leading-8 text-[#6B7280]">
              تصفح متاجر الموردين المعتمدين داخل منصة Packora.
            </p>
          </div>

          <div className="grid divide-y divide-[#E5E7EB]">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/store/${vendor.storeSlug}`}
                className="flex items-center gap-4 py-6"
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[#E5E7EB] bg-white">
                  {vendor.storeLogo ? (
                    <Image
                      src={vendor.storeLogo}
                      alt={vendor.storeName || vendor.name || "Vendor"}
                      width={120}
                      height={120}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store size={34} strokeWidth={1.7} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold">
                    {vendor.storeName || vendor.name || "متجر مورد"}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6B7280]">
                    {vendor.storeDescription ||
                      "مورد منتجات تغليف وبلاستيك داخل Packora."}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#111827]">
                    {vendor.products.length} منتج
                  </p>
                </div>

                <ChevronLeft size={24} strokeWidth={1.7} />
              </Link>
            ))}
          </div>
        </section>

        <PackoraBottomNav active="account" />
      </section>
    </main>
  );
}
