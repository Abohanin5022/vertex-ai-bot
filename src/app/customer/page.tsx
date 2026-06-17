import { connection } from "next/server";
import { MobilePackoraHeader } from "@/components/mobile-packora-header";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { PackoraIntro } from "@/components/packora-intro";
import { ProductGrid } from "@/components/product-grid";
import { mobileConfig } from "@/lib/mobile-config";
import { prisma } from "@/lib/prisma";

export default async function CustomerPage() {
  await connection();

  const products = await prisma.product
    .findMany({
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
      take: 80,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        stock: true,
        image: true,
      },
    })
    .catch(() => []);

  return (
    <main dir="rtl" className={mobileConfig.pageClassName}>
      <section className="mx-auto min-h-screen max-w-7xl bg-white shadow-[0_20px_60px_rgba(236,72,153,0.08)] sm:my-4 sm:rounded-[24px]">
        <MobilePackoraHeader products={products} />
        <PackoraIntro />
        <ProductGrid products={products} />
        <PackoraBottomNav active="home" />
      </section>
    </main>
  );
}
