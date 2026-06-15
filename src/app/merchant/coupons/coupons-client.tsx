"use client";

import { useState, type FormEvent } from "react";
import { Price } from "@/components/price";

type Coupon = {
  id: string;
  code: string;
  discount: number;
  active: boolean;
};

type Props = {
  initialCoupons: Coupon[];
};

export function CouponsClient({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createCoupon(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: formData.get("code"),
        discount: Number(formData.get("discount")),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(data?.error || "تعذر إنشاء الكوبون");
      return;
    }

    const coupon = (await response.json()) as Coupon;
    setCoupons((current) => [coupon, ...current]);
    form.reset();
    setMessage("تم إنشاء الكوبون بنجاح");
  }

  return (
    <>
      <section className="rounded-[32px] border border-[var(--packora-border)] bg-white p-6">
        <h2 className="text-2xl font-black text-[var(--packora-navy)]">
          إضافة كوبون
        </h2>

        <form onSubmit={createCoupon} className="mt-6 grid gap-4">
          <input
            name="code"
            required
            placeholder="كود الخصم مثل PACKORA10"
            className="rounded-2xl border border-[var(--packora-border)] p-4 outline-none focus:border-[var(--packora-blue)]"
          />

          <input
            name="discount"
            required
            min={1}
            step="0.01"
            type="number"
            placeholder="قيمة الخصم"
            className="rounded-2xl border border-[var(--packora-border)] p-4 outline-none focus:border-[var(--packora-blue)]"
          />

          {message ? (
            <p className="rounded-2xl bg-[var(--packora-cyan-soft)] p-3 text-sm font-black text-[#6B7280]">
              {message}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="rounded-2xl bg-[var(--packora-blue)] py-4 font-black text-white hover:bg-[var(--packora-blue-dark)] disabled:opacity-60"
          >
            {loading ? "جاري إنشاء الكوبون..." : "إنشاء الكوبون"}
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-3">
        {coupons.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--packora-border)] bg-white p-8 text-center text-sm font-bold text-[#6B7280]">
            لا توجد كوبونات حتى الآن
          </div>
        ) : null}

        {coupons.map((coupon) => (
          <article
            key={coupon.id}
            className="flex items-center justify-between rounded-[28px] border border-[var(--packora-border)] bg-white p-5"
          >
            <div>
              <h3 className="text-xl font-black text-[var(--packora-navy)]">
                {coupon.code}
              </h3>

              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[#6B7280]">
                <span>خصم</span>
                <Price
                  amount={coupon.discount}
                  className="text-sm font-bold text-[var(--packora-blue)]"
                  iconClassName="h-4 w-4"
                />
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-black ${
                coupon.active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {coupon.active ? "مفعل" : "متوقف"}
            </span>
          </article>
        ))}
      </section>
    </>
  );
}
