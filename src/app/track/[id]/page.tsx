import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderRatingForm } from "@/components/order-rating-form";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { mobileConfig } from "@/lib/mobile-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusMap: Record<string, string> = {
  pending: "جديد",
  processing: "قيد التجهيز",
  shipped: "جاهز للشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusStyles: Record<string, string> = {
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#111827]">
            الطلب غير موجود
          </h1>

          <Link
            href="/packora-1"
            className="mt-5 inline-block rounded-full bg-[#2563EB] px-6 py-3 font-semibold text-white"
          >
            الرجوع للمتجر
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className={`${mobileConfig.pageClassName} bg-[#F8FAFC]`}>
      <section className="mx-auto max-w-md bg-white shadow-sm md:mt-6 md:rounded-[28px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-4">
          <Link
            href="/packora-1"
            aria-label="الرجوع للمتجر"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#E5E7EB] text-[#111827]"
          >
            <ArrowRight size={20} />
          </Link>

          <h1 className="text-lg font-semibold text-[#111827]">تتبع الطلب</h1>

          <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#6B7280]">
            #{order.id.slice(0, 6)}
          </span>
        </header>

        <section className="p-4">
          <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              Packora Order
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-[#111827]">
              #{order.id.slice(0, 8)}
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              العميل: {order.customer}
            </p>

            <span
              className={`mt-5 inline-block rounded-full border px-4 py-2 text-sm font-semibold ${
                statusStyles[order.status] || statusStyles.pending
              }`}
            >
              {statusMap[order.status] || order.status}
            </span>
          </div>

          <div className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-lg font-semibold text-[#111827]">المنتجات</h3>

            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[18px] border border-[#E5E7EB] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#111827]">
                        {item.name}
                      </h4>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        الكمية: {item.quantity}
                      </p>
                    </div>

                    <Price
                      amount={item.price * item.quantity}
                      className="text-sm font-semibold text-[#111827]"
                      iconClassName="h-4 w-4"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">الإجمالي</span>
              <Price
                amount={order.total}
                className="text-3xl font-semibold text-[#111827]"
                iconClassName="h-6 w-6"
              />
            </div>

            <a
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 block rounded-full bg-[#111827] py-4 text-center font-semibold text-white"
            >
              تحميل الفاتورة PDF
            </a>
          </div>

          <OrderRatingForm
            orderId={order.id}
            status={order.status}
            items={order.items}
          />
        </section>
      </section>
      <PackoraBottomNav active="orders" />
    </main>
  );
}
