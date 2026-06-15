import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Package,
  PackagePlus,
  ReceiptText,
  Settings,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Price } from "@/components/price";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

const statusLabels: Record<string, string> = {
  bank_transfer_review: "بانتظار مراجعة التحويل",
  pending: "جديد",
  processing: "قيد التجهيز",
  shipped: "جاهز للشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusStyles: Record<string, string> = {
  bank_transfer_review: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

type MerchantOrder = {
  id: string;
  customer: string;
  phone: string;
  total: number;
  commission: number;
  merchantNet: number;
  status: string;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
};

export default async function MerchantPage() {
  await connection();

  const user = await requireRole("merchant");
  const productRefs = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const productIds = productRefs.map((product) => product.id);
  const productNames = productRefs.map((product) => product.name);
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const merchantData = await Promise.all([
    prisma.product.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.product.count({
      where: {
        userId: user.id,
        isActive: true,
        stock: {
          gt: 0,
          lt: 10,
        },
      },
    }),
    prisma.product.count({
      where: {
        userId: user.id,
        isActive: true,
        stock: {
          lt: 5,
        },
      },
    }),
    prisma.product.count({
      where: {
        userId: user.id,
        isActive: false,
      },
    }),
    prisma.product.findMany({
      where: {
        userId: user.id,
        isActive: true,
        stock: {
          gt: 0,
          lt: 10,
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        stock: true,
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: todayStart,
        },
        items: {
          some: itemFilter,
        },
      },
      select: {
        id: true,
        customer: true,
        phone: true,
        total: true,
        commission: true,
        merchantNet: true,
        status: true,
        createdAt: true,
        items: {
          where: itemFilter,
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    }) as Promise<MerchantOrder[]>,
    prisma.order.count({
      where: {
        status: {
          in: ["pending", "bank_transfer_review"],
        },
        items: {
          some: itemFilter,
        },
      },
    }),
    prisma.order.count({
      where: {
        status: "processing",
        items: {
          some: itemFilter,
        },
      },
    }),
    prisma.order.findMany({
      where: {
        items: {
          some: itemFilter,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        customer: true,
        phone: true,
        total: true,
        commission: true,
        merchantNet: true,
        status: true,
        createdAt: true,
        items: {
          where: itemFilter,
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    }) as Promise<MerchantOrder[]>,
  ]).catch(() => null);

  if (!merchantData) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7FBFF] p-6 text-[#070B2A]">
        <section className="max-w-md rounded-[28px] border border-[#DCEBFF] bg-white p-8 text-center">
          <h1 className="text-2xl font-black">تعذر تحميل لوحة التاجر</h1>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            تعذر الاتصال بقاعدة البيانات حاليًا. حاول مرة أخرى بعد قليل.
          </p>
        </section>
      </main>
    );
  }

  const [
    productCount,
    lowStockCount,
    criticalStockCount,
    disabledProductsCount,
    lowStockProducts,
    todayOrders,
    pendingOrdersCount,
    processingOrdersCount,
    latestOrders,
  ] = merchantData;

  const todaySales = sumOrders(todayOrders);
  const todayCommissions = sumCommissions(todayOrders);
  const todayProfit = Math.max(0, todaySales - todayCommissions);

  return (
    <main className="min-h-screen bg-[#F7FBFF] px-4 py-5 text-[#070B2A] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[34px] bg-[#070B2A] text-white shadow-[0_28px_90px_rgba(7,11,42,0.20)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#4FE7C5]">
                Packora 2
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                مركز إدارة التاجر
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">
                إدارة المنتجات والطلبات والتحليلات وإعدادات المتجر من لوحة واحدة مخصصة للتاجر.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
              <p className="text-sm text-white/70">المتجر</p>
              <h2 className="mt-2 text-2xl font-black">
                {user.storeName || user.name || "متجر Packora"}
              </h2>
              <p className="mt-2 text-sm text-[#4FE7C5]">
                {productCount} منتج نشط في لوحة التاجر
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 bg-[linear-gradient(135deg,#1766E8,#4FE7C5)] p-4 sm:grid-cols-3">
            <HeroStat label="طلبات جديدة" value={pendingOrdersCount} />
            <HeroStat label="قيد التجهيز" value={processingOrdersCount} />
            <HeroStat label="مخزون منخفض" value={lowStockCount} />
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="المبيعات اليوم"
            icon={<Wallet size={22} />}
            value={
              <Price
                amount={todaySales}
                className="text-3xl font-black text-[#070B2A]"
              />
            }
          />
          <MetricCard
            title="الطلبات"
            icon={<ShoppingCart size={22} />}
            value={todayOrders.length}
          />
          <MetricCard
            title="الأرباح"
            icon={<TrendingUp size={22} />}
            value={
              <Price
                amount={todayProfit}
                className="text-3xl font-black text-[#070B2A]"
              />
            }
          />
          <MetricCard
            title="العمولات"
            icon={<ReceiptText size={22} />}
            value={
              <Price
                amount={todayCommissions}
                className="text-3xl font-black text-[#070B2A]"
              />
            }
          />
          <MetricCard
            title="المخزون المنخفض"
            icon={<AlertTriangle size={22} />}
            value={lowStockCount}
            danger={lowStockCount > 0}
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="إجراءات سريعة" subtitle="Packora 2">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction href="/packora-2/products/new" title="إضافة منتج" icon={<PackagePlus size={20} />} />
              <QuickAction href="/packora-2/products" title="إدارة المنتجات" icon={<Package size={20} />} />
              <QuickAction href="/packora-2/orders" title="إدارة الطلبات" icon={<ClipboardList size={20} />} />
              <QuickAction href="/packora-2/analytics" title="التحليلات" icon={<BarChart3 size={20} />} />
              <QuickAction href="/packora-2/settings" title="إعدادات المتجر" icon={<Settings size={20} />} />
            </div>
          </Panel>

          <Panel title="تنبيهات التشغيل" subtitle="المخزون والحالة">
            <div className="grid gap-3 sm:grid-cols-3">
              <AlertCard label="أقل من 10" value={lowStockCount} tone="orange" />
              <AlertCard label="أقل من 5" value={criticalStockCount} tone="red" />
              <AlertCard label="منتجات معطلة" value={disabledProductsCount} tone="slate" />
            </div>

            {lowStockCount > 0 ? (
              <div className="mt-4 grid gap-2">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/packora-2/products/${product.id}/edit`}
                    className="flex items-center justify-between rounded-2xl border border-[#DCEBFF] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[#1766E8]"
                  >
                    <span>{product.name}</span>
                    <span className={product.stock < 5 ? "text-red-600" : "text-orange-600"}>
                      {product.stock} متبقي
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState text="لا توجد تنبيهات مخزون حاليًا." />
            )}
          </Panel>
        </section>

        <Panel title="آخر الطلبات" subtitle="متابعة مباشرة" className="mt-5">
          {latestOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-right text-xs font-semibold text-[#64748B]">
                    <th className="px-3 py-2">رقم الطلب</th>
                    <th className="px-3 py-2">العميل</th>
                    <th className="px-3 py-2">الحالة</th>
                    <th className="px-3 py-2">المنتجات</th>
                    <th className="px-3 py-2">الإجمالي</th>
                    <th className="px-3 py-2">التاريخ</th>
                    <th className="px-3 py-2">عرض</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map((order) => (
                    <tr key={order.id} className="bg-[#F7FBFF]">
                      <td className="rounded-r-2xl px-3 py-4 font-black">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-4">{order.customer}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                            statusStyles[order.status] || statusStyles.pending
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-3 py-4">
                        <Price
                          amount={sumOrder(order)}
                          className="text-sm font-black text-[#1766E8]"
                        />
                      </td>
                      <td className="px-3 py-4 text-sm text-[#64748B]">
                        {dateFormatter.format(order.createdAt)}
                      </td>
                      <td className="rounded-l-2xl px-3 py-4">
                        <Link
                          href={`/packora-2/orders/${order.id}`}
                          className="rounded-full bg-[#070B2A] px-4 py-2 text-xs font-black text-white"
                        >
                          التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="لا توجد طلبات بعد. ستظهر الطلبات الجديدة هنا." />
          )}
        </Panel>
      </section>
    </main>
  );
}

function sumOrder(order: { items: { price: number; quantity: number }[] }) {
  return order.items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
}

function sumOrders(orders: MerchantOrder[]) {
  return orders.reduce((sum, order) => sum + sumOrder(order), 0);
}

function sumCommissions(orders: MerchantOrder[]) {
  return orders.reduce((sum, order) => sum + Number(order.commission || 0), 0);
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/18 p-4 backdrop-blur">
      <p className="text-sm text-white/82">{label}</p>
      <strong className="mt-1 block text-3xl font-black">{value}</strong>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  danger = false,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  danger?: boolean;
}) {
  return (
    <article className="rounded-[28px] border border-[#DCEBFF] bg-white p-5 shadow-[0_18px_48px_rgba(7,11,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid h-12 w-12 place-items-center rounded-2xl ${
            danger ? "bg-red-50 text-red-600" : "bg-[#E9FBF7] text-[#1766E8]"
          }`}
        >
          {icon}
        </span>
        <p className="text-sm font-semibold text-[#64748B]">{title}</p>
      </div>
      <div className="mt-5 text-3xl font-black">{value}</div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[30px] border border-[#DCEBFF] bg-white p-5 shadow-[0_18px_48px_rgba(7,11,42,0.05)] ${className}`}>
      <p className="text-sm font-semibold text-[#1766E8]">{subtitle}</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function QuickAction({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[22px] border border-[#DCEBFF] bg-white p-4 text-sm font-black transition hover:-translate-y-1 hover:border-[#1766E8] hover:shadow-[0_18px_35px_rgba(23,102,232,0.12)]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E9FBF7] text-[#1766E8]">
        {icon}
      </span>
      {title}
    </Link>
  );
}

function AlertCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "orange" | "slate";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "orange"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-[22px] border p-4 ${toneClass}`}>
      <p className="text-sm font-semibold">{label}</p>
      <strong className="mt-1 block text-3xl font-black">{value}</strong>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#DCEBFF] bg-[#F7FBFF] p-8 text-center text-sm font-semibold text-[#64748B]">
      {text}
    </div>
  );
}
