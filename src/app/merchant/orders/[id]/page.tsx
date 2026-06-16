import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  CalendarDays,
  MapPin,
  Phone,
  ReceiptText,
  User,
} from "lucide-react";
import { Price } from "@/components/price";
import { prisma } from "@/lib/prisma";
import { OrderStatusActions } from "../order-status-actions";
import { BankTransferReviewActions } from "./bank-transfer-review-actions";
import { OrderDetailActions } from "./order-detail-actions";

const statusStyles: Record<string, string> = {
  bank_transfer_review: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  preparing: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  payment_rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  bank_transfer_review: "بانتظار مراجعة التحويل",
  pending: "جديد",
  confirmed: "مؤكد",
  preparing: "قيد التجهيز",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  payment_rejected: "مرفوض الدفع",
  cancelled: "ملغي",
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "full",
  timeStyle: "short",
});

export default async function MerchantOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const statusLabel = statusLabels[order.status] || order.status;
  const whatsappUrl = buildWhatsAppUrl({
    phone: order.phone,
    orderId: order.id,
    status: statusLabel,
  });

  return (
    <main className="min-h-screen bg-[var(--packora-cyan-soft)] p-4 text-[var(--packora-navy)] print:bg-white">
      <section className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)] print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/packora-2/orders"
                className="print:hidden inline-flex rounded-full border border-[var(--packora-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
              >
                رجوع للطلبات
              </Link>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Order Details
              </p>

              <h1 className="mt-3 text-4xl font-black">
                طلب #{order.id.slice(0, 8)}
              </h1>

              <p className="mt-2 text-sm text-[var(--packora-muted)]">
                تفاصيل الطلب، الفاتورة، الطباعة، والتواصل مع العميل.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span
                className={`rounded-full border px-4 py-2 text-sm font-black ${
                  statusStyles[order.status] || statusStyles.pending
                }`}
              >
                {statusLabel}
              </span>

              <OrderDetailActions whatsappUrl={whatsappUrl} />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <section className="rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)] print:shadow-none">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--packora-blue)]">
                    المنتجات
                  </p>
                  <h2 className="mt-1 text-2xl font-black">محتويات الطلب</h2>
                </div>

                <ReceiptText className="text-[var(--packora-blue)]" size={26} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-right">
                  <thead className="border-y border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] text-sm text-[#64748B]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">المنتج</th>
                      <th className="px-4 py-3 font-semibold">الكمية</th>
                      <th className="px-4 py-3 font-semibold">السعر</th>
                      <th className="px-4 py-3 font-semibold">الإجمالي</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--packora-border)]">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 font-semibold">{item.name}</td>
                        <td className="px-4 py-4 text-[#64748B]">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4">
                          <Price
                            amount={item.price}
                            className="text-sm font-semibold text-[var(--packora-navy)]"
                            iconClassName="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Price
                            amount={item.price * item.quantity}
                            className="text-sm font-black text-[var(--packora-blue)]"
                            iconClassName="h-4 w-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)] print:shadow-none">
              <div className="mb-5">
                <p className="text-sm font-semibold text-[var(--packora-blue)]">
                  بيانات العميل
                </p>
                <h2 className="mt-1 text-2xl font-black">معلومات التوصيل</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={<User size={20} />}
                  label="اسم العميل"
                  value={order.customer || "غير محدد"}
                />
                <InfoCard
                  icon={<Phone size={20} />}
                  label="رقم الجوال"
                  value={order.phone || "غير محدد"}
                />
                <InfoCard
                  icon={<MapPin size={20} />}
                  label="المدينة"
                  value={order.city || "غير محددة"}
                />
                <InfoCard
                  icon={<CalendarDays size={20} />}
                  label="تاريخ الطلب"
                  value={dateFormatter.format(order.createdAt)}
                />
              </div>

              <div className="mt-3 rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--packora-muted)]">
                  العنوان
                </p>
                <p className="mt-2 font-semibold leading-7">
                  {order.address || "لا يوجد عنوان محفوظ"}
                </p>
              </div>
            </section>
          </div>

          <aside className="grid gap-5 self-start">
            {order.paymentMethod === "bank_transfer" ? (
              <section className="print:hidden rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
                <p className="text-sm font-semibold text-[var(--packora-blue)]">
                  التحويل البنكي
                </p>
                <h2 className="mt-1 text-xl font-black">إيصال التحويل</h2>

                <div className="mt-4 rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-4">
                  <SummaryRow
                    label="حالة الدفع"
                    value={order.paymentStatus || "unpaid"}
                  />
                  <div className="mt-3">
                    <SummaryRow
                      label="حالة الإيصال"
                      value={order.paymentProofStatus || "pending"}
                    />
                  </div>
                </div>

                {order.bankTransferReceipt ? (
                  <div className="mt-4 grid gap-2">
                    <a
                      href={order.bankTransferReceipt}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[var(--packora-navy)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--packora-blue)]"
                    >
                      عرض الإيصال
                    </a>
                    <a
                      href={order.bankTransferReceipt}
                      download
                      className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-center text-sm font-semibold text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
                    >
                      تحميل الإيصال
                    </a>
                  </div>
                ) : (
                  <p className="mt-4 rounded-[22px] bg-red-50 p-4 text-sm font-semibold text-red-700">
                    لا يوجد إيصال مرفوع لهذا الطلب.
                  </p>
                )}

                {order.bankTransferReceipt &&
                order.paymentProofStatus !== "approved" ? (
                  <BankTransferReviewActions orderId={order.id} />
                ) : null}
              </section>
            ) : null}

            <section className="rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)] print:shadow-none">
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                ملخص الطلب
              </p>

              <div className="mt-5 grid gap-3">
                <SummaryRow label="عدد المنتجات" value={`${order.items.length}`} />
                <SummaryRow
                  label="إجمالي الكميات"
                  value={`${order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}`}
                />

                <div className="my-2 h-px bg-[var(--packora-border)]" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[var(--packora-muted)]">
                    الإجمالي
                  </span>
                  <Price
                    amount={order.total || itemsTotal}
                    className="text-3xl font-black text-[var(--packora-navy)]"
                    iconClassName="h-6 w-6"
                  />
                </div>
              </div>

              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                className="print:hidden mt-6 block rounded-full bg-[var(--packora-navy)] py-4 text-center text-sm font-semibold text-white transition hover:bg-[var(--packora-blue)]"
              >
                تحميل الفاتورة PDF
              </a>
            </section>

            <section className="print:hidden rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
              <p className="text-sm font-semibold text-[var(--packora-blue)]">
                تغيير الحالة
              </p>
              <h2 className="mt-1 text-xl font-black">تحديث حالة الطلب</h2>

              <div className="mt-5">
                <OrderStatusActions
                  orderId={order.id}
                  currentStatus={order.status}
                  compact
                />
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--packora-border)] p-4">
      <div className="flex items-center gap-2 text-[var(--packora-blue)]">
        {icon}
        <span className="text-sm font-semibold text-[var(--packora-muted)]">
          {label}
        </span>
      </div>
      <p className="mt-3 font-black">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-[var(--packora-muted)]">
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeSaudiPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("966")) {
    return digits;
  }

  if (digits.startsWith("05")) {
    return `966${digits.slice(1)}`;
  }

  if (digits.startsWith("5")) {
    return `966${digits}`;
  }

  return digits;
}

function buildWhatsAppUrl({
  phone,
  orderId,
  status,
}: {
  phone: string;
  orderId: string;
  status: string;
}) {
  const message = `مرحبًا، طلبك في Packora رقم #${orderId.slice(
    0,
    8
  )} حالته الآن: ${status}. شكرًا لك.`;

  return `https://wa.me/${normalizeSaudiPhone(
    phone
  )}?text=${encodeURIComponent(message)}`;
}
