import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminVendorsPage() {
  const vendors = await prisma.user.findMany({
    where: {
      role: "merchant",
    },
    include: {
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section>
      <header className="mb-6 border-b border-[#E5E7EB] pb-6">
        <p className="text-sm text-[#6B7280]">Admin Dashboard</p>

        <h1 className="mt-2 text-[36px] font-semibold leading-tight">
          الموردون المعتمدون
        </h1>

        <p className="mt-3 text-[#6B7280]">
          إدارة الموردين والمتاجر النشطة داخل Packora.
        </p>
      </header>

      {vendors.length === 0 ? (
        <div className="rounded-[28px] border border-[#E5E7EB] p-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#E5E7EB] text-[#9CA3AF]">
            <Store size={38} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold">لا يوجد موردون</h2>

          <p className="mt-2 text-[#6B7280]">
            سيظهر الموردون بعد قبول طلبات الانضمام.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <article
              key={vendor.id}
              className="rounded-[28px] border border-[#E5E7EB] p-5"
            >
              <div className="flex items-center gap-4">
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

                <div className="min-w-0">
                  <h2 className="line-clamp-1 text-xl font-semibold">
                    {vendor.storeName || vendor.name || "متجر مورد"}
                  </h2>

                  <p className="mt-1 line-clamp-1 text-sm text-[#6B7280]">
                    {vendor.email}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {vendor.products.length} منتج
                  </p>
                </div>
              </div>

              <p className="mt-5 line-clamp-3 leading-7 text-[#6B7280]">
                {vendor.storeDescription || "لا يوجد وصف للمتجر."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    vendor.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {vendor.isActive ? "مفعل" : "معطل"}
                </span>

                {vendor.storeSlug && (
                  <Link
                    href={`/store/${vendor.storeSlug}`}
                    target="_blank"
                    className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
                  >
                    عرض المتجر
                  </Link>
                )}

                <Link
                  href={`/admin/vendors/${vendor.id}`}
                  className="rounded-full border border-[#E5E7EB] px-5 py-3 text-sm font-semibold"
                >
                  التفاصيل
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
