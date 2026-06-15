import Link from "next/link";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { AlertTriangle, CreditCard, PackageX, ShoppingCart, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export default async function MerchantNotificationsPage() {
  await connection();

  const user = await requireRole("merchant");
  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      stock: true,
      isActive: true,
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

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const bankTransferOrders = orders.filter(
    (order) => order.status === "bank_transfer_review"
  );
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const lowStockProducts = products.filter((product) => product.stock < 10);
  const disabledProducts = products.filter((product) => !product.isActive);

  return (
    <main className="min-h-screen bg-[var(--packora-cyan-soft)] p-4 text-[var(--packora-navy)]">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-[var(--packora-border)] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--packora-blue)]">
                Notification Center
              </p>

              <h1 className="mt-3 text-4xl font-semibold">مركز الإشعارات</h1>

              <p className="mt-2 text-sm text-[#6B7280]">
                الطلبات الجديدة، تنبيهات المخزون، المنتجات المعطلة، والطلبات
                الملغاة.
              </p>
            </div>

            <Link
              href="/packora-2"
              className="rounded-full border border-[var(--packora-border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:text-[var(--packora-blue)]"
            >
              رجوع للوحة التاجر
            </Link>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-2">
          <NotificationSection
            title="تحويلات بنكية بانتظار المراجعة"
            count={bankTransferOrders.length}
            empty="لا توجد تحويلات بنكية بانتظار المراجعة."
          >
            {bankTransferOrders.map((order) => (
              <NotificationItem
                key={order.id}
                href={`/packora-2/orders/${order.id}`}
                icon={<CreditCard size={20} />}
                title={`مراجعة إيصال #${order.id.slice(0, 8)}`}
                description={`${order.customer || "عميل"} - ${order.items.length} منتجات`}
                tone="orange"
              />
            ))}
          </NotificationSection>

          <NotificationSection
            title="الطلبات الجديدة"
            count={pendingOrders.length}
            empty="لا توجد طلبات جديدة."
          >
            {pendingOrders.map((order) => (
              <NotificationItem
                key={order.id}
                href={`/packora-2/orders/${order.id}`}
                icon={<ShoppingCart size={20} />}
                title={`طلب جديد #${order.id.slice(0, 8)}`}
                description={`${order.customer || "عميل"} - ${order.items.length} منتجات`}
                tone="blue"
              />
            ))}
          </NotificationSection>

          <NotificationSection
            title="المنتجات منخفضة المخزون"
            count={lowStockProducts.length}
            empty="كل المنتجات بمخزون مستقر."
          >
            {lowStockProducts.map((product) => (
              <NotificationItem
                key={product.id}
                href={`/packora-2/products/${product.id}/edit`}
                icon={<AlertTriangle size={20} />}
                title={product.stock === 0 ? "نفد المنتج" : "نفد المخزون قريبًا"}
                description={`${product.name} - المتبقي ${product.stock}`}
                tone={product.stock < 5 ? "red" : "orange"}
              />
            ))}
          </NotificationSection>

          <NotificationSection
            title="الطلبات الملغاة"
            count={cancelledOrders.length}
            empty="لا توجد طلبات ملغاة."
          >
            {cancelledOrders.map((order) => (
              <NotificationItem
                key={order.id}
                href={`/packora-2/orders/${order.id}`}
                icon={<XCircle size={20} />}
                title={`طلب ملغي #${order.id.slice(0, 8)}`}
                description={order.customer || "عميل"}
                tone="red"
              />
            ))}
          </NotificationSection>

          <NotificationSection
            title="المنتجات المعطلة"
            count={disabledProducts.length}
            empty="لا توجد منتجات معطلة."
          >
            {disabledProducts.map((product) => (
              <NotificationItem
                key={product.id}
                href={`/packora-2/products/${product.id}/edit`}
                icon={<PackageX size={20} />}
                title="منتج معطل"
                description={product.name}
                tone="slate"
              />
            ))}
          </NotificationSection>
        </section>
      </section>
    </main>
  );
}

function NotificationSection({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[var(--packora-border)] bg-white p-5 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{title}</h2>
        <span className="rounded-full bg-[var(--packora-cyan)] px-4 py-2 text-sm font-black text-[var(--packora-blue)]">
          {count}
        </span>
      </div>

      {count === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-6 text-center text-sm font-semibold text-[var(--packora-muted)]">
          {empty}
        </div>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}
    </section>
  );
}

function NotificationItem({
  href,
  icon,
  title,
  description,
  tone,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone: "blue" | "orange" | "red" | "slate";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[22px] border border-[var(--packora-border)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--packora-blue)] hover:shadow-[0_12px_30px_rgba(23,102,232,0.10)]"
    >
      <span className={iconClassName(tone)}>{icon}</span>

      <span className="min-w-0">
        <span className="block truncate font-black">{title}</span>
        <span className="mt-1 block truncate text-sm text-[var(--packora-muted)]">
          {description}
        </span>
      </span>
    </Link>
  );
}

function iconClassName(tone: string) {
  const base = "grid h-11 w-11 shrink-0 place-items-center rounded-2xl";

  if (tone === "red") {
    return `${base} bg-red-50 text-red-600`;
  }

  if (tone === "orange") {
    return `${base} bg-orange-50 text-orange-600`;
  }

  if (tone === "blue") {
    return `${base} bg-[var(--packora-cyan)] text-[var(--packora-blue)]`;
  }

  return `${base} bg-slate-50 text-slate-600`;
}
