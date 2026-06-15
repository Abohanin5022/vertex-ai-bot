import Link from "next/link";
import { AlertTriangle, Bell, PackageX, ShoppingCart, XCircle } from "lucide-react";

type NotificationOrder = {
  id: string;
  customer: string;
};

type NotificationProduct = {
  id: string;
  name: string;
  stock: number;
  isActive: boolean;
};

type MerchantNotificationsProps = {
  pendingOrders: NotificationOrder[];
  lowStockProducts: NotificationProduct[];
  cancelledOrders?: NotificationOrder[];
  disabledProducts?: NotificationProduct[];
  compact?: boolean;
};

export function MerchantNotifications({
  pendingOrders,
  lowStockProducts,
  cancelledOrders = [],
  disabledProducts = [],
  compact = false,
}: MerchantNotificationsProps) {
  const items = [
    ...pendingOrders.slice(0, 3).map((order) => ({
      key: `order-${order.id}`,
      icon: ShoppingCart,
      title: `طلب جديد #${order.id.slice(0, 8)}`,
      description: order.customer || "عميل جديد",
      href: `/packora-2/orders/${order.id}`,
      tone: "blue",
    })),
    ...lowStockProducts.slice(0, 3).map((product) => ({
      key: `stock-${product.id}`,
      icon: AlertTriangle,
      title: product.stock === 0 ? "نفد المنتج" : "نفد المخزون قريبًا",
      description: `${product.name} - المتبقي ${product.stock}`,
      href: `/packora-2/products/${product.id}/edit`,
      tone: product.stock <= 5 ? "red" : "orange",
    })),
    ...cancelledOrders.slice(0, 2).map((order) => ({
      key: `cancelled-${order.id}`,
      icon: XCircle,
      title: `طلب ملغي #${order.id.slice(0, 8)}`,
      description: order.customer || "عميل",
      href: `/packora-2/orders/${order.id}`,
      tone: "red",
    })),
    ...disabledProducts.slice(0, 2).map((product) => ({
      key: `disabled-${product.id}`,
      icon: PackageX,
      title: "منتج معطل",
      description: product.name,
      href: `/packora-2/products/${product.id}/edit`,
      tone: "slate",
    })),
  ];

  if (compact) {
    const total = pendingOrders.length + lowStockProducts.length;

    return (
      <Link
        href="/packora-2/notifications"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-[var(--packora-border)] text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:text-[var(--packora-blue)]"
        aria-label="الإشعارات"
      >
        <Bell size={19} />
        {total > 0 ? (
          <span className="absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-[var(--packora-orange)] px-1 text-xs font-black text-white">
            {total}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <section className="rounded-[30px] border border-[var(--packora-border)] bg-white p-5 shadow-[0_18px_45px_rgba(7,11,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--packora-blue)]">
            الإشعارات
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--packora-navy)]">
            ما يحتاج انتباهك
          </h2>
        </div>

        <Link
          href="/packora-2/notifications"
          className="rounded-full border border-[var(--packora-border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--packora-blue)] hover:text-[var(--packora-blue)]"
        >
          عرض الكل
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-6 text-center text-sm font-semibold text-[var(--packora-muted)]">
          لا توجد تنبيهات حالية. كل شيء يبدو مستقرًا.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.slice(0, 5).map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-3 rounded-[22px] border border-[var(--packora-border)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--packora-blue)] hover:shadow-[0_12px_30px_rgba(23,102,232,0.10)]"
              >
                <span className={iconClassName(item.tone)}>
                  <Icon size={20} />
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-black text-[var(--packora-navy)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-[var(--packora-muted)]">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
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
