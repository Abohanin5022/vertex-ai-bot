"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useDesktopCartStore } from "@/store/desktop-cart-store";

type DesktopAddToCartProps = {
  product: {
    id: string;
    name: string;
    category?: string | null;
    image?: string | null;
    price: number;
  };
};

export function DesktopAddToCart({ product }: DesktopAddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const redirectTimer = useRef<number | null>(null);
  const addItem = useDesktopCartStore((state) => state.addItem);

  function addToCart() {
    addItem({
      ...product,
      quantity,
    });
    setAdded(true);
    redirectTimer.current = window.setTimeout(() => {
      router.push("/desktop-store/cart");
    }, 1500);
  }

  function continueShopping() {
    if (redirectTimer.current) {
      window.clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }

    setAdded(false);
  }

  return (
    <div className="mt-7 rounded-[24px] border border-[var(--packora-border)] p-4">
      <p className="text-sm font-semibold text-[#64748B]">الكمية</p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--packora-border)] transition hover:bg-[#F8FAFC]"
          aria-label="تقليل الكمية"
        >
          <Minus size={17} />
        </button>

        <span className="grid h-10 min-w-14 place-items-center rounded-full bg-[var(--packora-cyan-soft)] px-5 text-base font-semibold">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => setQuantity((current) => current + 1)}
          className="grid h-10 w-10 place-items-center rounded-full bg-[var(--packora-blue)] text-white transition hover:bg-[var(--packora-blue-dark)]"
          aria-label="زيادة الكمية"
        >
          <Plus size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={addToCart}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--packora-blue)] px-8 py-4 font-semibold text-white transition hover:bg-[var(--packora-blue-dark)]"
      >
        <ShoppingCart size={19} />
        إضافة للسلة
      </button>

      {added ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[#070B2A]/35 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={34} />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[var(--packora-navy)]">
              تمت إضافة المنتج للسلة
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              سيتم نقلك إلى السلة خلال لحظات، أو يمكنك متابعة التسوق.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={continueShopping}
                className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold text-[var(--packora-navy)]"
              >
                متابعة التسوق
              </button>

              <button
                type="button"
                onClick={() => router.push("/desktop-store/cart")}
                className="rounded-full bg-[var(--packora-blue)] px-5 py-3 text-sm font-semibold text-white"
              >
                إتمام الشراء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
