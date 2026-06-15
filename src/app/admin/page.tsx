import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  ClipboardCheck,
  ClipboardList,
  Database,
  Layers,
  Package,
  ReceiptText,
  Server,
  Store,
  TrendingUp,
  UserPlus,
  WalletCards,
  Wifi,
} from "lucide-react";
import { Price } from "@/components/price";
import { prisma } from "@/lib/prisma";

const adminShortcuts = [
  {
    title: "اعتماد تاجر",
    description: "راجع طلبات فتح المتاجر واعتمد الموردين الجدد بسرعة.",
    href: "/admin/vendor-applications",
    action: "فتح الطلبات",
    icon: ClipboardCheck,
  },
  {
    title: "إضافة مسؤول",
    description: "إدارة حسابات الفريق والموردين من مركز التحكم.",
    href: "/admin/vendors",
    action: "إدارة المستخدمين",
    icon: UserPlus,
  },
  {
    title: "تعديل العمولات",
    description: "تحكم في عمولة المنصة ونموذج الربحية.",
    href: "/admin/monetization",
    action: "فتح الربحية",
    icon: WalletCards,
  },
  {
    title: "إدارة الباقات",
    description: "راجع باقات التجار وحدود المنتجات ونسب العمولة.",
    href: "/admin/monetization",
    action: "إدارة الباقات",
    icon: Layers,
  },
];

export default async function AdminPage() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const adminData = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
      _sum: {
        total: true,
        platformRevenue: true,
      },
    }),
    prisma.user.count({
      where: {
        role: "merchant",
        isActive: true,
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
    prisma.vendorApplication.count({
      where: {
        status: "pending",
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lt: 10,
        },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
        status: {
          in: ["cancelled", "canceled"],
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: {
          in: ["failed", "declined", "error", "cancelled", "canceled"],
        },
      },
    }),
    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        customer: true,
        total: true,
        items: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "merchant",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        storeName: true,
        isActive: true,
      },
    }),
    prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        stock: true,
      },
    }),
    prisma.user.groupBy({
      by: ["subscriptionPlanKey"],
      where: {
        role: "merchant",
        isActive: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.subscriptionPlan.findMany({
      select: {
        key: true,
        name: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]).catch(() => null);

  if (!adminData) {
    return (
      <section className="rounded-[30px] border border-[#E5E7EB] bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-[#070B2A]">
          تعذر تحميل لوحة الإدارة
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6B7280]">
          تعذر الاتصال بقاعدة البيانات حاليًا. حاول مرة أخرى بعد قليل.
        </p>
      </section>
    );
  }

  const [
    todayOrdersCount,
    todayTotals,
    activeMerchantsCount,
    activeProductsCount,
    pendingApplicationsCount,
    lowStockProductsCount,
    cancelledOrdersTodayCount,
    paymentErrorsCount,
    latestOrders,
    latestMerchants,
    latestProducts,
    merchantsByPlanGroups,
    plans,
  ] = adminData;

  const todaySales = todayTotals._sum.total || 0;
  const todayCommissions = todayTotals._sum.platformRevenue || 0;
  const planNames = new Map(plans.map((plan) => [plan.key, plan.name]));
  const merchantsByPlan = Object.fromEntries(
    merchantsByPlanGroups.map((group) => [
      group.subscriptionPlanKey,
      group._count._all,
    ])
  );

  const systemHealth = [
    {
      title: "قاعدة البيانات",
      value: "متصل",
      description: "Prisma جاهز ويقرأ بيانات المنصة.",
      icon: Database,
      tone: "success",
    },
    {
      title: "Moyasar",
      value: process.env.MOYASAR_SECRET_KEY ? "جاهز" : "غير مفعّل",
      description: process.env.MOYASAR_SECRET_KEY
        ? "مفاتيح الدفع موجودة في البيئة."
        : "أضف مفاتيح Moyasar في Environment Variables.",
      icon: WalletCards,
      tone: process.env.MOYASAR_SECRET_KEY ? "success" : "warning",
    },
    {
      title: "PWA",
      value: "جاهز",
      description: "Manifest وتجربة التثبيت مفعّلة.",
      icon: Wifi,
      tone: "success",
    },
    {
      title: "API Status",
      value: "يعمل",
      description: "مسارات الطلبات والمنتجات متاحة.",
      icon: Server,
      tone: "success",
    },
  ];

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] bg-[#070B2A] p-6 text-white shadow-[0_24px_70px_rgba(7,11,42,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-[#4FE7C5]">
              Packora Admin
            </p>

            <h1 className="mt-3 text-[34px] font-semibold leading-tight md:text-[44px]">
              Admin Command Center
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              مركز مراقبة العمليات، الطلبات، التجار، المنتجات، الربحية وصحة
              النظام من شاشة واحدة.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">ملخص اليوم</p>
            <div className="mt-2 flex items-center gap-2 text-[#4FE7C5]">
              <TrendingUp size={20} />
              <Price amount={todaySales} className="text-2xl font-semibold" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="إجمالي المبيعات اليوم"
          value={
            <Price
              amount={todaySales}
              className="text-3xl font-semibold text-[#070B2A]"
            />
          }
          icon={<TrendingUp size={22} />}
        />
        <MetricCard
          title="إجمالي الطلبات اليوم"
          value={todayOrdersCount}
          icon={<ReceiptText size={22} />}
        />
        <MetricCard
          title="التجار النشطون"
          value={activeMerchantsCount}
          icon={<Store size={22} />}
        />
        <MetricCard
          title="المنتجات النشطة"
          value={activeProductsCount}
          icon={<Package size={22} />}
        />
        <MetricCard
          title="العمولات اليوم"
          value={
            <Price
              amount={todayCommissions}
              className="text-3xl font-semibold text-[#1766E8]"
            />
          }
          icon={<WalletCards size={22} />}
          accent
        />
      </div>

      <Panel
        title="التنبيهات"
        subtitle="الأمور التي تحتاج متابعة قبل أن تتحول لمشكلة تشغيلية."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AlertCard
            title="طلبات تجار جديدة"
            value={pendingApplicationsCount}
            description="بانتظار الموافقة"
            href="/admin/vendor-applications"
            icon={<ClipboardList size={20} />}
          />
          <AlertCard
            title="منتجات منخفضة المخزون"
            value={lowStockProductsCount}
            description="أقل من 10 وحدات"
            href="/packora-2/products"
            icon={<AlertTriangle size={20} />}
            danger={lowStockProductsCount > 0}
          />
          <AlertCard
            title="طلبات ملغاة اليوم"
            value={cancelledOrdersTodayCount}
            description="راجع أسباب الإلغاء"
            href="/packora-2/orders"
            icon={<ReceiptText size={20} />}
          />
          <AlertCard
            title="أخطاء الدفع"
            value={paymentErrorsCount}
            description="عمليات تحتاج مراجعة"
            href="/admin/monetization"
            icon={<WalletCards size={20} />}
            danger={paymentErrorsCount > 0}
          />
        </div>
      </Panel>

      <Panel
        title="الإجراءات السريعة"
        subtitle="اختصارات الإدارة اليومية داخل Packora."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminShortcuts.map((shortcut) => (
            <ActionCard key={shortcut.title} {...shortcut} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="آخر الطلبات" subtitle="أحدث نشاط شرائي داخل المنصة.">
          <div className="grid divide-y divide-[#E5E7EB]">
            {latestOrders.length === 0 ? (
              <EmptyState text="لا توجد طلبات بعد." />
            ) : (
              latestOrders.map((order) => (
                <ActivityItem
                  key={order.id}
                  title={`طلب #${order.id.slice(0, 8)}`}
                  meta={`${order.customer} · ${order.items.length} منتج`}
                  value={
                    <Price amount={order.total} className="font-semibold" />
                  }
                />
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="آخر التجار المسجلين"
          subtitle="أحدث المتاجر التي دخلت Packora."
        >
          <div className="grid divide-y divide-[#E5E7EB]">
            {latestMerchants.length === 0 ? (
              <EmptyState text="لا يوجد تجار مسجلون." />
            ) : (
              latestMerchants.map((merchant) => (
                <ActivityItem
                  key={merchant.id}
                  title={merchant.storeName || merchant.name || "متجر جديد"}
                  meta={merchant.email}
                  value={merchant.isActive ? "نشط" : "معطل"}
                />
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="آخر المنتجات المضافة"
          subtitle="منتجات جديدة تظهر في متاجر الموردين."
        >
          <div className="grid divide-y divide-[#E5E7EB]">
            {latestProducts.length === 0 ? (
              <EmptyState text="لا توجد منتجات بعد." />
            ) : (
              latestProducts.map((product) => (
                <ActivityItem
                  key={product.id}
                  title={product.name}
                  meta={`${product.category} · مخزون ${product.stock}`}
                  value={<Price amount={product.price} className="font-semibold" />}
                />
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="صحة النظام"
        subtitle="نظرة سريعة على المكونات الأساسية للتشغيل."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {systemHealth.map((item) => (
            <HealthCard key={item.title} {...item} />
          ))}
        </div>
      </Panel>

      <Panel
        title="التجار حسب الباقة"
        subtitle="توزيع التجار النشطين على باقات Packora."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(merchantsByPlan).length === 0 ? (
            <EmptyState text="لا توجد اشتراكات نشطة بعد." />
          ) : (
            Object.entries(merchantsByPlan).map(([planKey, count]) => (
              <div
                key={planKey}
                className="rounded-[22px] border border-[#E5E7EB] bg-[#F8FBFF] p-4"
              >
                <p className="text-sm text-[#6B7280]">
                  {planNames.get(planKey) || planKey}
                </p>
                <strong className="mt-2 block text-3xl font-semibold text-[#070B2A]">
                  {count}
                </strong>
              </div>
            ))
          )}
        </div>
      </Panel>
    </section>
  );
}

function MetricCard({
  title,
  value,
  icon,
  accent = false,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <article className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_40px_rgba(7,11,42,0.04)]">
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl ${
          accent
            ? "bg-[#1766E8] text-white"
            : "bg-[#EFFFFA] text-[#1766E8]"
        }`}
      >
        {icon}
      </div>
      <p className="mt-4 text-sm text-[#6B7280]">{title}</p>
      <div className="mt-2 text-3xl font-semibold text-[#070B2A]">{value}</div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_40px_rgba(7,11,42,0.03)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#070B2A]">{title}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ActionCard({
  title,
  description,
  href,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: typeof ClipboardCheck;
}) {
  return (
    <article className="rounded-[24px] border border-[#E5E7EB] bg-[#F8FBFF] p-5">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#1766E8] shadow-sm">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#070B2A]">{title}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#6B7280]">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-full bg-[#070B2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1766E8]"
      >
        {action}
      </Link>
    </article>
  );
}

function AlertCard({
  title,
  value,
  description,
  href,
  icon,
  danger = false,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: ReactNode;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
        danger
          ? "border-rose-200 bg-rose-50"
          : "border-[#D7F7EF] bg-[#F1FFFB]"
      }`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl ${
          danger ? "bg-white text-rose-600" : "bg-white text-[#1766E8]"
        }`}
      >
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-[#070B2A]">{title}</p>
      <strong className="mt-1 block text-3xl font-semibold text-[#070B2A]">
        {value}
      </strong>
      <p className="mt-1 text-xs text-[#6B7280]">{description}</p>
    </Link>
  );
}

function ActivityItem({
  title,
  meta,
  value,
}: {
  title: string;
  meta: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-[#070B2A]">{title}</p>
        <p className="mt-1 truncate text-xs text-[#6B7280]">{meta}</p>
      </div>
      <div className="shrink-0 text-sm text-[#1766E8]">{value}</div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Database;
  tone: string;
}) {
  const isSuccess = tone === "success";

  return (
    <article className="rounded-[22px] border border-[#E5E7EB] bg-[#F8FBFF] p-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl ${
            isSuccess
              ? "bg-[#EFFFFA] text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon size={20} />
        </div>
        {isSuccess ? (
          <BadgeCheck className="text-emerald-600" size={20} />
        ) : (
          <AlertTriangle className="text-amber-600" size={20} />
        )}
      </div>
      <h3 className="mt-4 font-semibold text-[#070B2A]">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#1766E8]">{value}</p>
      <p className="mt-2 text-xs leading-6 text-[#6B7280]">{description}</p>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#E5E7EB] p-5 text-center text-sm text-[#6B7280]">
      {text}
    </div>
  );
}
