import Link from "next/link";
import { connection } from "next/server";
import { ShoppingCart, X } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { prisma } from "@/lib/prisma";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      user: {
        is: {
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    return (
      <main
        dir="rtl"
        className="grid min-h-screen place-items-center bg-white p-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-semibold">المنتج غير موجود</h1>
          <Link
            href="/packora-1"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
          >
            الرجوع للمتجر
          </Link>
        </div>
      </main>
    );
  }

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

          <h1 className="text-xl font-semibold">تفاصيل المنتج</h1>

          <Link
            href="/packora-1/cart"
            aria-label="السلة"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB]"
          >
            <ShoppingCart size={20} />
          </Link>
        </header>

        <section className="px-6 pt-6">
          <div className="grid h-[420px] place-items-center bg-white">
            <ProductImage
              src={product.image}
              alt={product.name}
              priority
              className="h-full w-full object-contain p-6"
              fallbackClassName="grid h-full w-full place-items-center rounded-[28px] border border-[#E5E7EB] bg-[#F8FAFC] text-7xl"
            />
          </div>

          <div className="mt-6 border-t border-[#E5E7EB] pt-6">
            <p className="text-sm font-semibold text-[#6B7280]">
              {product.category}
            </p>

            <h2 className="mt-3 text-[32px] font-semibold leading-tight">
              {product.name}
            </h2>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">السعر</p>
                <strong className="text-3xl font-semibold">
                  <Price
                    amount={product.price}
                    className="text-3xl font-semibold text-[#111827]"
                    iconClassName="h-6 w-6"
                  />
                </strong>
              </div>

              <span className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#6B7280]">
                متوفر {product.stock}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-[#E5E7EB] pt-6">
              <h3 className="text-xl font-semibold">الوصف</h3>
              <p className="mt-3 leading-8 text-[#6B7280]">
                {product.description}
              </p>
            </div>
          )}
        </section>

        <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-md -translate-x-1/2 grid-cols-[1fr_2fr] gap-3 border-t border-[#E5E7EB] bg-white p-4">
          <Link
            href="/packora-1"
            className="rounded-full border border-[#E5E7EB] py-4 text-center font-semibold"
          >
            رجوع
          </Link>

          <AddToCartButton
            id={product.id}
            name={product.name}
            category={product.category}
            image={product.image}
            price={product.price}
            quantity={1}
          />
        </nav>
      </section>
    </main>
  );
}
