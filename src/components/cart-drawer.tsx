"use client";

import { Price } from "@/components/price";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <aside className="fixed left-4 top-4 z-50 w-[360px] rounded-2xl border border-[var(--packora-border)] bg-white p-5 shadow-2xl max-lg:static max-lg:mb-6 max-lg:w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[var(--packora-navy)]">
          السلة
        </h2>

        <span className="rounded-full border border-[var(--packora-border)] bg-[var(--packora-cyan)] px-3 py-1 text-sm font-black text-[var(--packora-blue)]">
          {items.length}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-6 text-center text-sm font-bold text-[#6B7280]">
            السلة فارغة
          </div>
        )}

        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[var(--packora-border)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-[var(--packora-navy)]">
                  {item.name}
                </h3>

                <p className="mt-1 text-sm text-[#6B7280]">
                  الكمية: {item.quantity}
                </p>
              </div>

              <Price
                amount={item.price * item.quantity}
                className="text-sm font-bold text-[var(--packora-blue)]"
                iconClassName="h-4 w-4"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-[var(--packora-navy)] p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-white/70">الإجمالي</span>

          <Price
            amount={total}
            className="text-3xl font-black text-white"
            iconClassName="h-6 w-6 brightness-0 invert"
          />
        </div>

        <a
          href="/packora-1/checkout"
          className="mt-5 block w-full rounded-xl bg-[var(--packora-orange)] py-4 text-center font-black text-white hover:bg-[var(--packora-orange-dark)]"
        >
          إتمام الطلب
        </a>
      </div>
    </aside>
  );
}
