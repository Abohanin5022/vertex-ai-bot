"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main dir="rtl" className="min-h-screen bg-white pb-56 text-[#111827]">
      <section className="mx-auto min-h-screen max-w-md bg-white">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5">
          <Link
            href="/packora-1"
            aria-label="إغلاق السلة"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#E5E7EB]"
          >
            <X size={21} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-semibold">سلة المشتريات</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {itemCount} منتج في السلة
            </p>
          </div>

          <ShoppingCart size={24} />
        </header>

        {items.length === 0 ? (
          <section className="grid min-h-[560px] place-items-center px-8 text-center">
            <div>
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[#F9FAFB] text-[#9CA3AF]">
                <ShoppingCart size={54} strokeWidth={1.6} />
              </div>

              <h2 className="mt-8 text-3xl font-semibold">السلة فارغة</h2>

              <p className="mt-3 text-xl leading-8 text-[#6B7280]">
                أضف منتجاتك ثم ارجع لإتمام الطلب.
              </p>

              <Link
                href="/packora-1"
                className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-semibold text-white"
              >
                تسوق الآن
              </Link>
            </div>
          </section>
        ) : (
          <section className="divide-y divide-[#E5E7EB]">
            {items.map((item) => (
              <article key={item.id} className="bg-white px-6 py-6">
                <div className="grid grid-cols-[116px_1fr] gap-5">
                  <div className="grid h-32 w-28 place-items-center bg-white">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      fallbackClassName="grid h-full w-full place-items-center rounded-[22px] border border-[#E5E7EB] bg-[#F8FAFC] text-[#9CA3AF]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 text-xl font-semibold leading-7">
                          {item.name}
                        </h2>

                        <p className="mt-2 text-sm text-[#6B7280]">
                          {item.category || "منتج"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-2xl font-light text-[#9CA3AF]"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => decreaseItem(item.id)}
                          className="grid h-10 w-10 place-items-center text-xl"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus size={17} />
                        </button>

                        <span className="min-w-10 text-center text-base font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseItem(item.id)}
                          className="grid h-10 w-10 place-items-center text-xl"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={17} />
                        </button>
                      </div>

                      <strong className="text-xl font-semibold">
                        <Price
                          amount={item.price * item.quantity}
                          className="text-xl font-semibold text-[#111827]"
                          iconClassName="h-5 w-5"
                        />
                      </strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="fixed bottom-[72px] left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[#E5E7EB] bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-base text-[#6B7280]">الإجمالي</span>

            <strong className="text-3xl font-semibold">
              <Price
                amount={total}
                className="text-3xl font-semibold text-[#111827]"
                iconClassName="h-6 w-6"
              />
            </strong>
          </div>

          <Link
            href="/packora-1/checkout"
            className={`mt-5 block rounded-full py-4 text-center text-lg font-semibold text-white ${
              items.length === 0
                ? "pointer-events-none bg-[#D1D5DB]"
                : "bg-black"
            }`}
          >
            إتمام الطلب
          </Link>
        </section>

        <PackoraBottomNav active="cart" />
      </section>
    </main>
  );
}
