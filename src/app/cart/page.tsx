"use client";

import Link from "next/link";
import { ShieldCheck, ShoppingCart, Sparkles, X } from "lucide-react";
import { CartItem } from "@/components/cart-item";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 0;
  const finalTotal = Math.max(subtotal - discount, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--packora-soft-pink)] pb-60 text-[var(--packora-navy)]">
      <section className="mx-auto min-h-screen max-w-md bg-white shadow-[0_20px_60px_rgba(236,72,153,0.08)]">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--packora-border)] bg-[linear-gradient(135deg,#FCE7F3,#FDF2F8)] px-5 py-4">
          <Link
            href="/packora-1"
            aria-label="إغلاق السلة"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--packora-border)] bg-white"
          >
            <X size={21} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-black">سلة المشتريات</h1>
            <p className="mt-1 text-xs font-semibold text-[var(--packora-muted)]">
              {itemCount} منتج في السلة
            </p>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--packora-blue)] text-white">
            <ShoppingCart size={21} />
          </div>
        </header>

        {items.length === 0 ? (
          <section className="grid min-h-[560px] place-items-center px-8 text-center">
            <div>
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-[32px] bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
                <ShoppingCart size={54} strokeWidth={1.6} />
              </div>

              <h2 className="mt-8 text-3xl font-black">السلة فارغة</h2>

              <p className="mt-3 text-base leading-8 text-[var(--packora-muted)]">
                أضف منتجاتك ثم ارجع لإتمام الطلب بتجربة دفع سهلة وآمنة.
              </p>

              <Link
                href="/packora-1"
                className="mt-8 inline-flex rounded-full bg-[var(--packora-blue)] px-8 py-4 font-black text-white shadow-[0_14px_28px_rgba(236,72,153,0.22)] transition hover:bg-[var(--packora-blue-dark)]"
              >
                تسوق الآن
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="px-4 py-5">
              <div className="rounded-[24px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[var(--packora-blue)]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black">راجع منتجاتك قبل الدفع</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--packora-muted)]">
                      الخصومات والكوبونات تظهر في Checkout قبل تأكيد الطلب.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3 px-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={increaseItem}
                  onDecrease={decreaseItem}
                  onRemove={removeItem}
                />
              ))}
            </section>
          </>
        )}

        <section className="fixed bottom-[72px] left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-[var(--packora-border)] bg-white/95 px-5 py-4 shadow-[0_-18px_44px_rgba(236,72,153,0.12)] backdrop-blur">
          <div className="rounded-[24px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--packora-muted)]">المجموع الفرعي</span>
              <Price amount={subtotal} className="font-bold text-[var(--packora-navy)]" />
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[var(--packora-muted)]">التوفير والخصومات</span>
              <Price amount={-discount} className="font-bold text-emerald-600" />
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--packora-border)] pt-3">
              <span className="font-black">الإجمالي</span>
              <Price
                amount={finalTotal}
                className="text-3xl font-black text-[var(--packora-blue)]"
                iconClassName="h-6 w-6"
              />
            </div>
          </div>

          <Link
            href="/packora-1/checkout"
            className={`mt-4 flex items-center justify-center gap-2 rounded-full py-4 text-center text-lg font-black text-white transition ${
              items.length === 0
                ? "pointer-events-none bg-[#D1D5DB]"
                : "bg-[var(--packora-blue)] shadow-[0_14px_28px_rgba(236,72,153,0.24)] hover:bg-[var(--packora-blue-dark)]"
            }`}
          >
            <ShieldCheck size={20} />
            إتمام الطلب
          </Link>
        </section>

        <PackoraBottomNav active="cart" />
      </section>
    </main>
  );
}
