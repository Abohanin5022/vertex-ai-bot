import Link from "next/link";
import type { ComponentType } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Monitor,
  PackagePlus,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Truck,
} from "lucide-react";
import { PackoraLogo } from "@/components/packora-logo";
import { getProducts } from "@/lib/products";
import { getSetupStatus } from "@/lib/setup-status";
import { CommerceCommandCenter } from "./commerce-command-center";

export const dynamic = "force-dynamic";

const formatter = {
  format(value: number) {
    return `${new Intl.NumberFormat("ar-SA", {
      maximumFractionDigits: 0,
    }).format(value)} ﷼`;
  },
};

const sidebarLinks = [
  { label: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { label: "إدارة المنتجات", href: "/packora-2/products", icon: Boxes },
  { label: "إضافة منتج", href: "/packora-2/products/new", icon: PackagePlus },
  { label: "طلبات التاجر", href: "/packora-2/orders", icon: ClipboardList },
  { label: "التحليلات", href: "/packora-2/analytics", icon: BarChart3 },
  { label: "إعدادات المتجر", href: "/packora-2/settings", icon: Settings },
];

const appLinks = [
  {
    title: "برنامج العميل",
    desc: "واجهة الموبايل الخاصة بالعملاء.",
    href: "/packora-1",
    icon: ShoppingBag,
    tone: "bg-[var(--packora-blue)] text-white",
  },
  {
    title: "برنامج الديسكتوب",
    desc: "واجهة عرض مستقلة للشاشات الكبيرة.",
    href: "/desktop-store",
    icon: Monitor,
    tone: "bg-[#0F172A] text-white",
  },
  {
    title: "لوحة التاجر",
    desc: "إضافة المنتجات والتحكم بالمخزون.",
    href: "/packora-2/products",
    icon: Store,
    tone: "bg-[var(--packora-orange)] text-white",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const setupStatus = getSetupStatus();

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.stock * product.price,
    0
  );
  const lowStock = products.filter((product) => product.stock <= 20).length;
  const readyCount = setupStatus.filter((item) => item.isConfigured).length;

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--packora-cyan)] text-[#111827]">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="border-l border-[var(--packora-border)] bg-white p-5 shadow-sm">
          <div className="rounded-[28px] border border-[var(--packora-border)] bg-white p-5 shadow-[0_18px_50px_rgba(47,101,230,0.10)]">
            <PackoraLogo href="/" size="desktop" />
            <p className="mt-4 text-sm leading-7 text-[#64748B]">
              مركز التحكم الذي يربط بين برنامج العميل، برنامج الديسكتوب، ولوحة
              التاجر من مكان واحد.
            </p>
          </div>

          <nav className="mt-5 grid gap-2 text-sm font-semibold">
            {sidebarLinks.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    index === 0
                      ? "bg-[var(--packora-blue)] text-white shadow-md"
                      : "bg-[var(--packora-cyan-soft)] text-[#334155] hover:bg-[#EAF2FF] hover:text-[var(--packora-blue)]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 grid gap-2">
            <Link
              href="/vendors"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#334155] ring-1 ring-[var(--packora-border)] hover:text-[var(--packora-blue)]"
            >
              الموردون
            </Link>
            <Link
              href="/become-vendor"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#334155] ring-1 ring-[var(--packora-border)] hover:text-[var(--packora-blue)]"
            >
              انضم كمورد
            </Link>
            <Link
              href="/track"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#334155] ring-1 ring-[var(--packora-border)] hover:text-[var(--packora-blue)]"
            >
              تتبع الطلب
            </Link>
          </div>
        </aside>

        <section className="min-w-0 p-5 sm:p-7">
          <header className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[var(--packora-blue)] via-[#2563EB] to-[#60EFFF] p-7 text-white shadow-[0_28px_70px_rgba(47,101,230,0.24)]">
            <div className="grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
              <div>
                <p className="text-sm font-semibold text-white/80">
                  Packora Control Center
                </p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                  إدارة موحدة لكل واجهات Packora
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/85">
                  أضف المنتج مرة واحدة من لوحة التاجر، وسيظهر في برنامج العميل
                  وبرنامج الديسكتوب بشكل مستقل لكل تجربة.
                </p>
              </div>

              <div className="rounded-[28px] bg-white/12 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white/80">جاهزية النظام</p>
                <div className="mt-4 flex items-end gap-2">
                  <strong className="text-5xl font-semibold">{readyCount}</strong>
                  <span className="pb-2 text-white/75">
                    / {setupStatus.length} عناصر مفعلة
                  </span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[var(--packora-orange)]"
                    style={{ width: `${(readyCount / setupStatus.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            {appLinks.map((app) => {
              const Icon = app.icon;

              return (
                <Link
                  key={app.href}
                  href={app.href}
                  className="group rounded-[30px] border border-[var(--packora-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-2xl ${app.tone}`}
                  >
                    <Icon size={26} />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">{app.title}</h2>
                  <p className="mt-2 min-h-[52px] text-sm leading-7 text-[#64748B]">
                    {app.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--packora-blue)]">
                    فتح الواجهة
                    <ExternalLink size={16} />
                  </span>
                </Link>
              );
            })}
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="عدد المنتجات"
              value={`${products.length}`}
              icon={Boxes}
            />
            <Metric title="إجمالي المخزون" value={`${totalStock}`} icon={Truck} />
            <Metric
              title="قيمة المخزون"
              value={formatter.format(inventoryValue)}
              icon={ReceiptText}
            />
            <Metric
              title="منتجات منخفضة"
              value={`${lowStock}`}
              icon={Tags}
              danger={lowStock > 0}
            />
          </section>

          <section className="mt-6 rounded-[32px] border border-[var(--packora-border)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">مركز التشغيل التجاري</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  إدارة المنتجات والطلبات وتجهيز الإطلاق.
                </p>
              </div>
              <Link
                href="/packora-2/products/new"
                className="rounded-full bg-[var(--packora-orange)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[var(--packora-orange-dark)]"
              >
                إضافة منتج جديد
              </Link>
            </div>

            <CommerceCommandCenter products={products} setupStatus={setupStatus} />
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  danger = false,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ size?: number }>;
  danger?: boolean;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--packora-border)] bg-white p-5 shadow-sm">
      <div
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          danger
            ? "bg-red-50 text-red-600"
            : "bg-[var(--packora-cyan)] text-[var(--packora-blue)]"
        }`}
      >
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm text-[#64748B]">{title}</p>
      <strong className="mt-2 block text-3xl font-semibold">{value}</strong>
    </article>
  );
}
