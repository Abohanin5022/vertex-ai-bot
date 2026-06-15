import Link from "next/link";
import { connection } from "next/server";
import {
  Boxes,
  ChevronLeft,
  CupSoda,
  Package,
  PackageOpen,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { prisma } from "@/lib/prisma";

function CategoryIcon({ name }: { name: string }) {
  const Icon =
    name.includes("صح") ? Utensils :
    name.includes("علب") ? PackageOpen :
    name.includes("أكواب") ? CupSoda :
    name.includes("أكياس") ? ShoppingBag :
    name.includes("ملاعق") ? Utensils :
    name.includes("كراتين") ? Boxes :
    name.includes("تغليف") ? Package :
    Package;

  return <Icon size={28} strokeWidth={1.7} />;
}

export default async function CategoriesPage() {
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
  });

  const categories = Object.values(
    products.reduce(
      (acc, product) => {
        const category = product.category || "أخرى";

        if (!acc[category]) {
          acc[category] = {
            name: category,
            count: 0,
          };
        }

        acc[category].count += 1;

        return acc;
      },
      {} as Record<string, { name: string; count: number }>
    )
  );

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

          <h1 className="text-xl font-semibold">الأقسام</h1>

          <span className="text-sm text-[#6B7280]">
            {categories.length} قسم
          </span>
        </header>

        <section className="px-6 pt-8">
          <div className="border-b border-[#E5E7EB] pb-8">
            <p className="text-sm font-semibold text-[#6B7280]">Packora</p>
            <h2 className="mt-3 text-[34px] font-semibold leading-tight">
              تصفح المنتجات حسب القسم
            </h2>
            <p className="mt-4 leading-8 text-[#6B7280]">
              اختر القسم المناسب وابدأ الطلب من منتجات التغليف والبلاستيك.
            </p>
          </div>

          <div className="grid divide-y divide-[#E5E7EB]">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/packora-1?category=${encodeURIComponent(category.name)}#products`}
                className="flex items-center justify-between py-6"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-[#E5E7EB] text-4xl">
                    <CategoryIcon name={category.name} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {category.count} منتج
                    </p>
                  </div>
                </div>

                <ChevronLeft size={24} strokeWidth={1.7} />
              </Link>
            ))}
          </div>
        </section>

        <PackoraBottomNav active="categories" />
      </section>
    </main>
  );
}
