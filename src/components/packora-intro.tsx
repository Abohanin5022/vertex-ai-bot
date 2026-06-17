import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  FileText,
  ForkKnife,
  Package,
  PackageOpen,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

const supplies = [
  { title: "صحون وأطباق", icon: ForkKnife },
  { title: "علب الطعام", icon: PackageOpen },
  { title: "أكواب ومستلزمات المشروبات", icon: Sparkles },
  { title: "ملاعق وشوك وسكاكين", icon: ForkKnife },
  { title: "أكياس التعبئة والتغليف", icon: ShoppingBag },
  { title: "كراتين الشحن والتغليف", icon: Package },
];

const reasons = [
  { title: "أسعار منافسة", icon: BadgeCheck },
  { title: "منتجات متنوعة", icon: Package },
  { title: "سهولة الطلب والمتابعة", icon: ClipboardCheck },
  { title: "فواتير إلكترونية", icon: FileText },
  { title: "تحديث حالة الطلب", icon: Truck },
  { title: "خدمة للمطاعم والكافيهات والمتاجر", icon: Sparkles },
];

export function PackoraIntro() {
  return (
    <section className="px-4 pb-3 pt-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[24px] border border-[var(--packora-border)] bg-white shadow-[0_20px_60px_rgba(236,72,153,0.08)]">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#FCE7F3,#FDF2F8)] p-6 text-[var(--packora-navy)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-8">
          <div>
            <p className="text-sm font-semibold text-[var(--packora-blue)]">
              Packora
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              كل احتياجات التغليف والبلاستيك في مكان واحد
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--packora-muted)] sm:text-base">
              Packora منصة متخصصة في توفير مستلزمات التغليف والبلاستيك
              للمطاعم والكافيهات ومحلات الحلويات والأسر المنتجة والمتاجر
              بمختلف أحجامها.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--packora-muted)] sm:text-base">
              نوفر منتجات عالية الجودة بأسعار تنافسية مع تجربة طلب سهلة
              وسريعة من خلال الموقع الإلكتروني.
            </p>

            <Link
              href="#products"
              className="mt-6 inline-flex rounded-full bg-[var(--packora-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--packora-blue-dark)]"
            >
              تسوق الآن
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {supplies.slice(0, 4).map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-[var(--packora-border)] bg-white p-4 shadow-[0_12px_30px_rgba(236,72,153,0.08)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
                    <Icon size={21} />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-6">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-2 lg:p-7">
          <InfoBlock title="ماذا نوفر؟" items={supplies} />
          <InfoBlock title="لماذا Packora؟" items={reasons} />
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    icon: typeof Package;
  }[];
}) {
  return (
    <section>
      <h2 className="text-lg font-black text-[var(--packora-navy)]">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--packora-border)] bg-white p-3 shadow-[0_10px_24px_rgba(236,72,153,0.06)]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
                <Icon size={18} />
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-[var(--packora-navy)]">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
