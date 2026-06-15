"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PackoraLogo } from "@/components/packora-logo";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { useDesktopCartStore } from "@/store/desktop-cart-store";

export default function DesktopCartPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const items = useDesktopCartStore((state) => state.items);
  const increaseItem = useDesktopCartStore((state) => state.increaseItem);
  const decreaseItem = useDesktopCartStore((state) => state.decreaseItem);
  const removeItem = useDesktopCartStore((state) => state.removeItem);
  const clearCart = useDesktopCartStore((state) => state.clearCart);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setMessage("السلة فارغة");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: formData.get("customer") || "عميل ديسكتوب",
        phone: formData.get("phone") || "",
        city: formData.get("city") || "",
        address: formData.get("address") || "طلب من واجهة الديسكتوب",
        total,
        items: items.map((item) => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      setMessage("تعذر تأكيد الطلب. حاول مرة أخرى.");
      return;
    }

    const order = (await response.json()) as { id: string };
    clearCart();
    setMessage("تم تأكيد الطلب بنجاح. يتم فتح صفحة التتبع...");

    setTimeout(() => {
      window.location.href = `/track/${order.id}`;
    }, 900);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F9FB] text-[#070B2A]">
      <header className="border-b border-[var(--packora-border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <PackoraLogo href="/desktop-store" size="desktop" />

          <Link
            href="/desktop-store"
            className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--packora-orange)] hover:bg-[#FFF7ED]"
          >
            متابعة التسوق
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-[1fr_390px] gap-8 px-8 py-10">
        <section className="rounded-[32px] border border-[var(--packora-border)] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[var(--packora-border)] pb-5">
            <div>
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                Desktop Cart
              </p>

              <h1 className="mt-2 text-3xl font-semibold">سلة الديسكتوب</h1>
            </div>

            <span className="rounded-full bg-[var(--packora-cyan)] px-4 py-2 text-sm font-semibold text-[var(--packora-blue)]">
              {items.length} منتج
            </span>
          </div>

          {items.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <h2 className="text-2xl font-semibold">السلة فارغة</h2>
                <p className="mt-3 text-[#64748B]">
                  اختر المنتجات من واجهة الديسكتوب ثم أضفها هنا.
                </p>
                <Link
                  href="/desktop-store"
                  className="mt-6 inline-block rounded-full bg-[var(--packora-blue)] px-7 py-4 font-semibold text-white"
                >
                  تصفح المنتجات
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--packora-border)]">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[120px_1fr_auto] items-center gap-5 py-6"
                >
                  <div className="grid h-28 w-28 place-items-center rounded-3xl border border-[var(--packora-border)] bg-white">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain p-4"
                      fallbackClassName="grid h-full w-full place-items-center text-[#64748B]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--packora-orange)]">
                      {item.category || "منتج"}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {item.name}
                    </h2>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                  </div>

                  <div className="text-left">
                    <Price
                      amount={item.price * item.quantity}
                      className="text-xl font-semibold text-[var(--packora-blue)]"
                      iconClassName="h-5 w-5"
                    />

                    <div className="mt-4 flex items-center gap-2 rounded-full border border-[var(--packora-border)] p-1">
                      <button
                        type="button"
                        onClick={() => decreaseItem(item.id)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-10 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseItem(item.id)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-[var(--packora-blue)] text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[32px] border border-[var(--packora-border)] bg-white p-6">
          <form onSubmit={submitOrder}>
            <p className="text-sm font-semibold text-[#64748B]">ملخص الطلب</p>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">الإجمالي</span>
              <Price
                amount={total}
                className="text-3xl font-semibold text-[var(--packora-blue)]"
                iconClassName="h-7 w-7"
              />
            </div>

            <div className="mt-6 grid gap-3">
              <Input name="customer" placeholder="اسم العميل" />
              <Input name="phone" placeholder="رقم الجوال" />
              <Input name="city" placeholder="المدينة" />

              <textarea
                name="address"
                placeholder="العنوان أو ملاحظات الطلب"
                className="min-h-[108px] rounded-[22px] border border-[var(--packora-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--packora-blue)]"
              />
            </div>

            {message ? (
              <p className="mt-4 rounded-2xl bg-[var(--packora-cyan-soft)] p-3 text-sm font-semibold text-[var(--packora-navy)]">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={items.length === 0 || loading}
              className="mt-6 w-full rounded-2xl bg-[var(--packora-blue)] py-4 font-black text-white transition hover:bg-[var(--packora-blue-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "جاري تأكيد الطلب..." : "إتمام الطلب"}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

function Input({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      className="rounded-full border border-[var(--packora-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--packora-blue)]"
    />
  );
}
