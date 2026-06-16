import Link from "next/link";
import { connection } from "next/server";
import { Price } from "@/components/price";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { AUTH_ROLES } from "@/lib/roles";
import { OrderStatusActions } from "./order-status-actions";
import { PaymentProofActions } from "./payment-proof-actions";

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  payment_rejected: "bg-red-50 text-red-700 border-red-200",
  bank_transfer_review: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  preparing: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  confirmed: "تم تأكيد الدفع",
  payment_rejected: "تم رفض الدفع",
  bank_transfer_review: "بانتظار مراجعة التحويل",
  pending: "جديد",
  preparing: "قيد التجهيز",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const paymentStatusStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unpaid: "bg-slate-50 text-slate-700 border-slate-200",
  pending: "bg-slate-50 text-slate-700 border-slate-200",
  manual_review: "bg-amber-50 text-amber-700 border-amber-200",
  manual_review_rejected: "bg-red-50 text-red-700 border-red-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const paymentStatusLabels: Record<string, string> = {
  paid: "مدفوع",
  unpaid: "غير مدفوع",
  pending: "غير مدفوع",
  manual_review: "مراجعة تحويل",
  manual_review_rejected: "تم رفض التحويل",
  failed: "فشل الدفع",
};

const paymentMethodLabels: Record<string, string> = {
  apple_pay: "Apple Pay",
  mada: "مدى",
  visa: "Visa",
  mastercard: "Mastercard",
  moyasar: "Moyasar",
  bank_transfer: "تحويل بنكي",
  cod: "دفع عند الاستلام",
};

const paymentProofStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const paymentProofStatusLabels: Record<string, string> = {
  pending: "بانتظار المراجعة",
  approved: "تم القبول",
  rejected: "تم الرفض",
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function OrdersPage() {
  await connection();

  const user = await requireRole(AUTH_ROLES.merchant);
  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });
  const productIds = products.map((product) => product.id);
  const productNames = products.map((product) => product.name);
  const itemFilter =
    productIds.length > 0
      ? {
          OR: [
            {
              productId: {
                in: productIds,
              },
            },
            {
              productId: null,
              name: {
                in: productNames,
              },
            },
          ],
        }
      : {
          productId: "__no_vendor_products__",
        };

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: itemFilter,
      },
    },
    include: {
      items: {
        where: itemFilter,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const unpaidOrders = orders.length - paidOrders.length;

  return (
    <main className="min-h-screen bg-[var(--packora-cyan-soft)] p-4">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Merchant Orders
              </p>

              <h1 className="mt-3 text-4xl font-semibold text-[var(--packora-navy)]">
                إدارة الطلبات
              </h1>

              <p className="mt-2 text-sm text-[#6B7280]">
                راقب الطلبات، حالة الدفع، إيصالات التحويل، وحالة التجهيز من مكان واحد.
              </p>
            </div>

            <Link
              href="/packora-2"
              className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold text-[var(--packora-navy)]"
            >
              لوحة التاجر
            </Link>
          </div>
        </header>

        <section className="rounded-[28px] border border-[var(--packora-border)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--packora-border)] p-5">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--packora-navy)]">
                قائمة الطلبات
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                الطلبات المعروضة تخص منتجات هذا التاجر فقط.
              </p>
            </div>

            <span className="rounded-full bg-[var(--packora-cyan)] px-4 py-2 text-sm font-semibold text-[var(--packora-blue)]">
              {orders.length} طلب
            </span>
          </div>

          <div className="grid gap-3 border-b border-[var(--packora-border)] p-5 sm:grid-cols-2">
            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                الطلبات المدفوعة
              </p>
              <strong className="mt-1 block text-3xl text-emerald-800">
                {paidOrders.length}
              </strong>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                الطلبات غير المدفوعة
              </p>
              <strong className="mt-1 block text-3xl text-slate-800">
                {unpaidOrders}
              </strong>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-2xl font-semibold text-[var(--packora-navy)]">
                لا توجد طلبات
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                ستظهر طلبات منتجاتك هنا مباشرة بعد تأكيد العميل للشراء.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1680px] text-right">
                <thead className="bg-[var(--packora-cyan-soft)] text-sm text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">رقم الطلب</th>
                    <th className="px-5 py-4 font-semibold">العميل</th>
                    <th className="px-5 py-4 font-semibold">الجوال</th>
                    <th className="px-5 py-4 font-semibold">طريقة الدفع</th>
                    <th className="px-5 py-4 font-semibold">حالة الدفع</th>
                    <th className="px-5 py-4 font-semibold">مبلغ الخصم</th>
                    <th className="px-5 py-4 font-semibold">الإجمالي النهائي</th>
                    <th className="px-5 py-4 font-semibold">إيصال التحويل</th>
                    <th className="px-5 py-4 font-semibold">حالة الإيصال</th>
                    <th className="px-5 py-4 font-semibold">حالة الطلب</th>
                    <th className="px-5 py-4 font-semibold">التاريخ</th>
                    <th className="px-5 py-4 font-semibold">عدد المنتجات</th>
                    <th className="px-5 py-4 font-semibold">مراجعة التحويل</th>
                    <th className="px-5 py-4 font-semibold">التفاصيل</th>
                    <th className="px-5 py-4 font-semibold">تغيير الحالة</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--packora-border)]">
                  {orders.map((order) => {
                    const quantityTotal = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    const paymentProofStatus =
                      order.paymentProofStatus || "pending";
                    const canReviewPaymentProof =
                      order.paymentMethod === "bank_transfer" &&
                      paymentProofStatus === "pending";

                    return (
                      <tr key={order.id} className="align-middle">
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-[var(--packora-border)] px-3 py-1 text-xs font-semibold text-[#64748B]">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-[var(--packora-navy)]">
                            {order.customer || "عميل"}
                          </p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            {order.city || "بدون مدينة"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#64748B]">
                          {order.phone || "بدون رقم"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[var(--packora-navy)]">
                          {paymentMethodLabels[order.paymentMethod] ??
                            order.paymentMethod}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              paymentStatusStyles[order.paymentStatus] ??
                              paymentStatusStyles.unpaid
                            }`}
                          >
                            {paymentStatusLabels[order.paymentStatus] ??
                              order.paymentStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Price
                            amount={order.discountAmount || 0}
                            className="text-sm font-semibold text-emerald-700"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <Price
                            amount={order.finalTotal || order.total}
                            className="text-base font-semibold text-[var(--packora-navy)]"
                          />
                        </td>

                        <td className="px-5 py-4">
                          {order.bankTransferReceipt ? (
                            <a
                              href={order.bankTransferReceipt}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-[var(--packora-border)] px-4 py-2 text-xs font-semibold text-[var(--packora-blue)] transition hover:bg-[var(--packora-cyan)]"
                            >
                              عرض الإيصال
                            </a>
                          ) : (
                            <span className="text-xs font-semibold text-[#94A3B8]">
                              لا يوجد
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              paymentProofStatusStyles[paymentProofStatus] ??
                              paymentProofStatusStyles.pending
                            }`}
                          >
                            {paymentProofStatusLabels[paymentProofStatus] ??
                              paymentProofStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusStyles[order.status] ?? statusStyles.pending
                            }`}
                          >
                            {statusLabels[order.status] ?? order.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#64748B]">
                          {dateFormatter.format(order.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-[var(--packora-navy)]">
                            {quantityTotal}
                          </span>
                          <span className="text-sm text-[#64748B]"> منتج</span>
                        </td>

                        <td className="px-5 py-4">
                          {canReviewPaymentProof ? (
                            <PaymentProofActions orderId={order.id} />
                          ) : (
                            <span className="text-xs font-semibold text-[#94A3B8]">
                              لا توجد مراجعة
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/packora-2/orders/${order.id}`}
                            className="rounded-full border border-[var(--packora-border)] px-4 py-2 text-sm font-semibold text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-cyan)]"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <OrderStatusActions
                            orderId={order.id}
                            currentStatus={order.status}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
