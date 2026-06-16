import Link from "next/link";
import { ArrowRight, Check, Circle, XCircle } from "lucide-react";
import { OrderRatingForm } from "@/components/order-rating-form";
import { PackoraBottomNav } from "@/components/packora-bottom-nav";
import { Price } from "@/components/price";
import { mobileConfig } from "@/lib/mobile-config";
import { prisma } from "@/lib/prisma";
import { PaymentProofReupload } from "./payment-proof-reupload";

export const dynamic = "force-dynamic";

const statusMap: Record<string, string> = {
  bank_transfer_review: "قيد المراجعة",
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  preparing: "قيد التجهيز",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  payment_rejected: "مرفوض الدفع",
  cancelled: "ملغي",
};

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

const paymentMethodLabels: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank_transfer: "تحويل بنكي",
  apple_pay: "Apple Pay",
  mada: "مدى",
  visa: "Visa",
  mastercard: "Mastercard",
  tabby: "Tabby",
  tamara: "Tamara",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "غير مدفوع",
  paid: "مدفوع",
  manual_review: "بانتظار مراجعة الدفع",
  manual_review_rejected: "تم رفض مراجعة الدفع",
  pending: "قيد الانتظار",
  failed: "فشل الدفع",
};

const paymentProofStatusLabels: Record<string, string> = {
  pending: "الإيصال قيد المراجعة",
  approved: "تم قبول التحويل",
  accepted: "تم قبول التحويل",
  rejected: "تم رفض التحويل",
};

const paymentProofStatusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
};

const statusSteps = [
  { key: "bank_transfer_review", label: "قيد المراجعة" },
  { key: "confirmed", label: "مؤكد" },
  { key: "preparing", label: "قيد التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "completed", label: "مكتمل" },
  { key: "payment_rejected", label: "مرفوض الدفع" },
];

function normalizeStatus(status: string) {
  if (status === "pending" || status === "bank_transfer_review") {
    return "bank_transfer_review";
  }

  if (status === "processing") {
    return "preparing";
  }

  return status;
}

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

  const isBankTransfer = order.paymentMethod === "bank_transfer";

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

          <StatusTimeline status={order.status} />

          <div className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-lg font-semibold text-[#111827]">
              تفاصيل الدفع
            </h3>

            <div className="mt-4 grid gap-3 text-sm">
              <InfoRow
                label="طريقة الدفع"
                value={
                  paymentMethodLabels[order.paymentMethod] ||
                  order.paymentMethod
                }
              />
              <InfoRow
                label="حالة الدفع"
                value={
                  paymentStatusLabels[order.paymentStatus] ||
                  order.paymentStatus
                }
              />
              {order.discountAmount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7280]">مبلغ الخصم</span>
                  <Price
                    amount={order.discountAmount}
                    className="text-sm font-semibold text-emerald-700"
                    iconClassName="h-4 w-4"
                  />
                </div>
              ) : null}
              {order.couponCode ? (
                <InfoRow label="كود الخصم" value={order.couponCode} />
              ) : null}
              {order.paymentProofStatus ? (
                <InfoRow
                  label="حالة إيصال التحويل"
                  value={
                    paymentProofStatusLabels[order.paymentProofStatus] ||
                    order.paymentProofStatus
                  }
                />
              ) : null}
            </div>

            {isBankTransfer && order.paymentProofStatus ? (
              <div
                className={`mt-5 rounded-[22px] border p-4 text-sm font-semibold leading-7 ${
                  paymentProofStatusStyles[order.paymentProofStatus] ||
                  paymentProofStatusStyles.pending
                }`}
              >
                {paymentProofStatusLabels[order.paymentProofStatus] ||
                  "الإيصال قيد المراجعة"}
              </div>
            ) : null}

            {isBankTransfer && order.paymentProofStatus === "rejected" ? (
              <PaymentProofReupload orderId={order.id} />
            ) : null}
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

function StatusTimeline({ status }: { status: string }) {
  const normalizedStatus = normalizeStatus(status);
  const activeIndex = statusSteps.findIndex(
    (step) => step.key === normalizedStatus
  );
  const isPaymentRejected = normalizedStatus === "payment_rejected";

  return (
    <section className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-lg font-semibold text-[#111827]">حالة الطلب</h3>

      <div className="mt-5 grid gap-3">
        {statusSteps.map((step, index) => {
          const isActive = step.key === normalizedStatus;
          const isDone =
            activeIndex >= index && activeIndex !== -1 && !isPaymentRejected;
          const isRejectedStep = step.key === "payment_rejected" && isActive;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 ${
                isActive || isDone
                  ? "border-[#1766E8] bg-[#F0F7FF]"
                  : "border-[#E5E7EB] bg-white"
              } ${isRejectedStep ? "border-red-200 bg-red-50" : ""}`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full ${
                  isRejectedStep
                    ? "bg-red-600 text-white"
                    : isActive || isDone
                      ? "bg-[#1766E8] text-white"
                      : "bg-[#F9FAFB] text-[#9CA3AF]"
                }`}
              >
                {isRejectedStep ? (
                  <XCircle size={17} />
                ) : isDone ? (
                  <Check size={17} />
                ) : (
                  <Circle size={13} />
                )}
              </span>

              <span
                className={`text-sm font-semibold ${
                  isRejectedStep
                    ? "text-red-700"
                    : isActive || isDone
                      ? "text-[#111827]"
                      : "text-[#6B7280]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#6B7280]">{label}</span>
      <span className="text-left font-semibold text-[#111827]">{value}</span>
    </div>
  );
}
