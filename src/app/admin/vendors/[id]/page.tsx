import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Store } from "lucide-react";
import { Price } from "@/components/price";
import { prisma } from "@/lib/prisma";

export default async function AdminVendorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      products: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!vendor || vendor.role !== "merchant") {
    notFound();
  }

  return (
    <section>
      <header className="mb-6 border-b border-[var(--packora-border)] pb-6">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold"
        >
          <ArrowRight size={16} />
          الموردون
        </Link>

        <p className="mt-6 text-sm text-[#6B7280]">Vendor Details</p>

        <h1 className="mt-2 text-[36px] font-semibold leading-tight">
          {vendor.storeName || vendor.name || "متجر مورد"}
        </h1>

        <p className="mt-3 text-[#6B7280]">{vendor.email}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-[28px] border border-[var(--packora-border)] p-6">
          <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-[var(--packora-border)]">
            {vendor.storeLogo ? (
              <Image
                src={vendor.storeLogo}
                alt={vendor.storeName || vendor.name || "Vendor"}
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store size={44} strokeWidth={1.7} />
            )}
          </div>

          <div className="mt-6 grid gap-3 text-sm text-[#6B7280]">
            <p>الحالة: {vendor.isActive ? "مفعل" : "معطل"}</p>
            <p>رابط المتجر: {vendor.storeSlug || "غير محدد"}</p>
            <p>عدد المنتجات: {vendor.products.length}</p>
          </div>

          {vendor.storeSlug && (
            <Link
              href={`/store/${vendor.storeSlug}`}
              target="_blank"
              className="mt-6 block rounded-full bg-[var(--packora-navy)] py-4 text-center font-semibold text-white"
            >
              عرض المتجر
            </Link>
          )}
        </aside>

        <section className="rounded-[28px] border border-[var(--packora-border)] p-6">
          <h2 className="text-2xl font-semibold">منتجات المورد</h2>

          <div className="mt-5 grid gap-3">
            {vendor.products.length === 0 ? (
              <p className="text-[#6B7280]">
                لا توجد منتجات لهذا المورد.
              </p>
            ) : (
              vendor.products.map((product) => (
                <article
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--packora-border)] p-4"
                >
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {product.category}
                    </p>
                  </div>

                  <Price
                    amount={product.price}
                    className="text-sm font-semibold text-[var(--packora-blue)]"
                    iconClassName="h-4 w-4"
                  />
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
