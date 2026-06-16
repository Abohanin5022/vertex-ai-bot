import Link from "next/link";
import { connection } from "next/server";
import { Bell, CheckCircle2, Clock3, ExternalLink } from "lucide-react";
import { MarkNotificationReadButton } from "./mark-notification-read-button";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { AUTH_ROLES } from "@/lib/roles";

const notificationTypeLabels: Record<string, string> = {
  new_order: "طلب جديد",
  bank_transfer_review: "مراجعة تحويل بنكي",
  bank_transfer_approved: "قبول تحويل بنكي",
  bank_transfer_rejected: "رفض تحويل بنكي",
  order_status_updated: "تحديث حالة طلب",
};

export default async function MerchantNotificationsPage() {
  await connection();

  const user = await requireRole(AUTH_ROLES.merchant);
  const notifications = await prisma.merchantNotification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      readAt: true,
      createdAt: true,
      orderId: true,
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  return (
    <main className="min-h-screen bg-[var(--packora-cyan-soft)] p-4 text-[var(--packora-navy)]">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Merchant Notifications
              </p>

              <h1 className="mt-3 text-4xl font-semibold">مركز الإشعارات</h1>

              <p className="mt-2 text-sm text-[var(--packora-muted)]">
                تابع إشعارات الطلبات والتحويلات البنكية الخاصة بمتجرك فقط.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--packora-cyan)] px-4 py-2 text-sm font-black text-[var(--packora-blue)]">
                {unreadCount} غير مقروءة
              </span>

              <Link
                href="/packora-2"
                className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:text-[var(--packora-blue)]"
              >
                العودة إلى لوحة التاجر
              </Link>
            </div>
          </div>
        </header>

        {notifications.length === 0 ? (
          <section className="rounded-[30px] border border-dashed border-[var(--packora-border)] bg-white p-10 text-center shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--packora-cyan)] text-[var(--packora-blue)]">
              <Bell size={34} />
            </div>

            <h2 className="mt-5 text-2xl font-black">لا توجد إشعارات حاليًا</h2>

            <p className="mt-2 text-sm text-[var(--packora-muted)]">
              ستظهر هنا إشعارات الطلبات الجديدة ومراجعة التحويلات البنكية.
            </p>
          </section>
        ) : (
          <section className="grid gap-3">
            {notifications.map((notification) => {
              const isRead = Boolean(notification.readAt);
              const orderHref = notification.orderId
                ? `/packora-2/orders/${notification.orderId}`
                : null;

              return (
                <article
                  key={notification.id}
                  className={`rounded-[28px] border bg-white p-5 shadow-[0_18px_45px_rgba(7,11,42,0.04)] ${
                    isRead
                      ? "border-[var(--packora-border)]"
                      : "border-[var(--packora-blue)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-2xl ${
                            isRead
                              ? "bg-slate-50 text-slate-500"
                              : "bg-[var(--packora-cyan)] text-[var(--packora-blue)]"
                          }`}
                        >
                          {isRead ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <Bell size={19} />
                          )}
                        </span>

                        <span className="rounded-full border border-[var(--packora-border)] px-3 py-1 text-xs font-semibold text-[var(--packora-muted)]">
                          {notificationTypeLabels[notification.type] ||
                            notification.type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isRead
                              ? "bg-slate-100 text-slate-600"
                              : "bg-[var(--packora-blue)] text-white"
                          }`}
                        >
                          {isRead ? "مقروء" : "غير مقروء"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black">
                        {notification.title}
                      </h2>

                      <p className="mt-2 leading-7 text-[var(--packora-muted)]">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--packora-muted)]">
                        <Clock3 size={15} />
                        <time dateTime={notification.createdAt.toISOString()}>
                          {notification.createdAt.toLocaleString("ar-SA", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {orderHref ? (
                        <Link
                          href={orderHref}
                          className="inline-flex items-center gap-2 rounded-full bg-[var(--packora-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--packora-blue)]"
                        >
                          عرض الطلب
                          <ExternalLink size={16} />
                        </Link>
                      ) : null}

                      {!isRead ? (
                        <MarkNotificationReadButton
                          notificationId={notification.id}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
