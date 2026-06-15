import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Package,
  ReceiptText,
  Settings,
  Store,
  Wallet,
} from "lucide-react";
import { PackoraLogo } from "@/components/packora-logo";

const features = [
  {
    title: "إدارة المنتجات",
    description:
      "أضف المنتجات والصور والأسعار والمخزون وحالة التوفر من لوحة واحدة.",
    icon: Package,
  },
  {
    title: "إدارة الطلبات",
    description:
      "تابع الطلبات الجديدة، قيد التجهيز، جاهز للشحن، مكتمل أو ملغي.",
    icon: ClipboardList,
  },
  {
    title: "التحليلات",
    description:
      "راقب المبيعات اليومية، أفضل المنتجات، حركة الطلبات ومؤشرات النمو.",
    icon: BarChart3,
  },
  {
    title: "الفواتير",
    description:
      "اعرض تفاصيل الطلب، الفاتورة، الطباعة، وواتساب العميل من مكان واحد.",
    icon: FileText,
  },
  {
    title: "الاشتراكات",
    description:
      "تابع باقة التاجر، حدود المنتجات، حالة الاشتراك، وخيارات الترقية.",
    icon: Settings,
  },
  {
    title: "العمولات",
    description:
      "اعرف عمولة المنصة وصافي ربح المتجر لكل طلب داخل Packora.",
    icon: ReceiptText,
  },
];

const stats = [
  { label: "المبيعات اليوم", value: "4,520", suffix: "﷼", icon: Wallet },
  { label: "الطلبات", value: "18", suffix: "طلب", icon: ClipboardList },
  { label: "الأرباح", value: "3,840", suffix: "﷼", icon: BarChart3 },
  { label: "المخزون المنخفض", value: "5", suffix: "منتجات", icon: Package },
];

export default function MerchantAppPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#070B2A] text-white">
      <header className="border-b border-white/10 bg-[#070B2A]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="rounded-2xl bg-white px-4 py-3">
            <PackoraLogo href="/packora-2" size="mobile" />
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/75 md:flex">
            <a href="#features">المزايا</a>
            <a href="#dashboard">لوحة الأداء</a>
            <Link href="/become-vendor">افتح متجرك</Link>
          </nav>

          <Link
            href="/packora-2/login"
            className="rounded-full bg-[#1766E8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f56ca]"
          >
            دخول التاجر
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4FE7C5]">
            Packora Merchant
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            تطبيق مستقل لإدارة متجر التغليف والبلاستيك
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
            واجهة خاصة للتاجر منفصلة بصريًا وتشغيليًا عن العميل، تجمع المنتجات
            والطلبات والتحليلات والفواتير والاشتراكات والعمولات في تجربة واحدة.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/packora-2/login"
              className="rounded-full bg-[#1766E8] px-7 py-4 font-black text-white transition hover:bg-[#0f56ca]"
            >
              افتح لوحة التاجر
            </Link>
            <Link
              href="/become-vendor"
              className="rounded-full border border-white/15 px-7 py-4 font-black text-white transition hover:border-[#4FE7C5]"
            >
              افتح متجرك معنا
            </Link>
          </div>
        </div>

        <div
          id="dashboard"
          className="rounded-[36px] border border-white/10 bg-white p-5 text-[#070B2A] shadow-[0_40px_120px_rgba(0,0,0,0.25)]"
        >
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#1766E8,#4FE7C5)] p-6 text-white">
            <p className="text-sm text-white/82">لوحة الأداء</p>
            <h2 className="mt-2 text-3xl font-black">Packora Merchant</h2>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-[24px] border border-[#DCEBFF] bg-[#F7FBFF] p-4"
                >
                  <Icon className="text-[#1766E8]" size={22} />
                  <strong className="mt-4 block text-3xl font-black">
                    {stat.value}
                  </strong>
                  <p className="mt-1 text-xs font-semibold text-[#64748B]">
                    {stat.label} {stat.suffix}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#4FE7C5]">
              ميزات Packora Merchant
            </p>
            <h2 className="mt-2 text-3xl font-black">
              كل أدوات التشغيل في مكان واحد
            </h2>
          </div>
          <Store className="hidden text-[#4FE7C5] md:block" size={34} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[30px] border border-white/10 bg-white/8 p-6 transition hover:-translate-y-1 hover:border-[#4FE7C5]"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#4FE7C5] text-[#070B2A]">
                  <Icon size={25} />
                </span>
                <h3 className="mt-5 text-2xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
