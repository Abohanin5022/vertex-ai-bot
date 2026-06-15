"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fulfillmentStatuses,
  getFulfillmentStatus,
} from "@/lib/checkout";
import { normalizeStoredOrder, type StoredOrder } from "@/lib/orders";
import { localOrdersKey } from "@/lib/storage-keys";

const formatter = {
  format(value: number) {
    return `${new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value)} ﷼`;
  },
};

function readLocalOrders() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(localOrdersKey) ?? "[]");
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeStoredOrder)
          .filter((order): order is StoredOrder => Boolean(order))
      : [];
  } catch {
    return [];
  }
}

export function OrderTracker() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("order") ?? "";
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [status, setStatus] = useState("أدخل رقم الطلب والجوال لعرض حالة الشحنة.");
  const activeStatusIndex = useMemo(() => {
    if (!order) {
      return 0;
    }

    return Math.max(
      0,
      fulfillmentStatuses.findIndex((item) => item.code === order.fulfillmentStatus),
    );
  }, [order]);

  async function findOrder(nextOrderNumber = orderNumber) {
    const normalizedOrderNumber = nextOrderNumber.trim();

    if (!normalizedOrderNumber) {
      setStatus("اكتب رقم الطلب أولًا.");
      return;
    }

    setStatus("جاري البحث عن الطلب...");

    const localOrder = readLocalOrders().find((item) => {
      const matchesOrder = item.orderNumber === normalizedOrderNumber;
      const matchesPhone = !phone.trim() || item.phone.endsWith(phone.trim().slice(-4));

      return matchesOrder && matchesPhone;
    });

    if (localOrder) {
      setOrder(localOrder);
      setStatus("تم العثور على الطلب من سجل هذا الجهاز.");
      return;
    }

    try {
      const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(normalizedOrderNumber)}`);
      const result = (await response.json()) as { orders?: unknown[] };
      const remoteOrder = result.orders
        ?.map(normalizeStoredOrder)
        .find((item): item is StoredOrder => Boolean(item));

      if (remoteOrder) {
        setOrder(remoteOrder);
        setStatus("تم العثور على الطلب من قاعدة البيانات.");
        return;
      }
    } catch {
      // Local tracking remains available even when cloud lookup is unavailable.
    }

    setOrder(null);
    setStatus("لم نجد طلبًا بهذا الرقم. تحقق من الرقم أو آخر 4 أرقام من الجوال.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void findOrder();
  }

  useEffect(() => {
    if (initialOrderNumber) {
      const timer = window.setTimeout(() => {
        void findOrder(initialOrderNumber);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderNumber]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f8f6] text-slate-950">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black text-emerald-700">Packora Tracking</p>
            <h1 className="text-xl font-black">تتبع الطلب</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/customer"
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"
            >
              المتجر
            </Link>
            <Link
              href="/become-vendor"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
            >
              التاجر
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black">بيانات التتبع</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{status}</p>
          <label className="mt-5 grid gap-1 text-sm font-bold text-slate-700">
            رقم الطلب
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="PKR-20260527-12345"
            />
          </label>
          <label className="mt-3 grid gap-1 text-sm font-bold text-slate-700">
            آخر 4 أرقام من الجوال
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="0000"
              inputMode="numeric"
            />
          </label>
          <button
            type="submit"
            className="mt-4 h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
          >
            عرض الحالة
          </button>
        </form>

        <section className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          {order ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-emerald-700">
                    {getFulfillmentStatus(order.fulfillmentStatus).customerLabel}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{order.orderNumber}</h2>
                  <p className="mt-2 text-sm text-slate-500">{order.product.name}</p>
                </div>
                <span className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white">
                  {formatter.format(order.totals.total)}
                </span>
              </div>

              <div className="mt-5 grid gap-2">
                {fulfillmentStatuses.slice(0, 6).map((item, index) => (
                  <article
                    key={item.code}
                    className={`rounded-lg border px-3 py-3 ${
                      index <= activeStatusIndex
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong>{item.customerLabel}</strong>
                      <span className="text-xs font-black">{index + 1}</span>
                    </div>
                    <p className="mt-1 text-sm">{item.detail}</p>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <span className="rounded-md bg-slate-50 p-3">
                  <span className="block text-slate-500">شركة الشحن</span>
                  <strong className="mt-1 block">{order.shippingQuote.carrierName}</strong>
                </span>
                <span className="rounded-md bg-slate-50 p-3">
                  <span className="block text-slate-500">رقم التتبع</span>
                  <strong className="mt-1 block">{order.shippingQuote.trackingNumber}</strong>
                </span>
                <span className="rounded-md bg-slate-50 p-3">
                  <span className="block text-slate-500">المدينة</span>
                  <strong className="mt-1 block">{order.city}</strong>
                </span>
                <span className="rounded-md bg-slate-50 p-3">
                  <span className="block text-slate-500">الدفع</span>
                  <strong className="mt-1 block">{order.paymentLabel}</strong>
                </span>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-lg bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
              نتيجة التتبع تظهر هنا بعد إدخال رقم الطلب.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
