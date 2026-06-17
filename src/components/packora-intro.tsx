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
  { title: "أكواب المشروبات", icon: Sparkles },
  { title: "ملاعق وشوك", icon: ForkKnife },
  { title: "أكياس التغليف", icon: ShoppingBag },
  { title: "كراتين الشحن", icon: Package },
];

const reasons = [
  { title: "أسعار منافسة", icon: BadgeCheck },
  { title: "منتجات متنوعة", icon: Package },
  { title: "طلب ومتابعة سهلة", icon: ClipboardCheck },
  { title: "فواتير إلكترونية", icon: FileText },
  { title: "تحديث حالة الطلب", icon: Truck },
  { title: "للمطاعم والمتاجر", icon: Sparkles },
];

export function PackoraIntro() {
  return (
    <section className="px-4 pb-3 pt-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[24px] border border-[var(--packora-border)] bg-white shadow-[0_20px_60px_rgba(236,72,153,0.08)]">
        <div className="grid gap-7 bg-[linear-gradient(135deg,#FCE7F3,#FDF2F8)] p-6 text-[var(--packora-navy)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8">
          <div>
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[var(--packora-blue)] shadow-[0_10px_24px_rgba(236,72,153,0.10)]">
              Packora Packaging Store
            </p>

            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              كل احتياجات التغليف والبلاستيك في مكان واحد
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--packora-muted)] sm:text-base">
              منصة متخصصة في مستلزمات التغليف والبلاستيك للمطاعم والكافيهات
              ومحلات الحلويات والأسر المنتجة والمتاجر، مع تجربة طلب سهلة وسريعة.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="#products"
                className="inline-flex rounded-full bg-[var(--packora-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(236,72,153,0.25)] transition hover:bg-[var(--packora-blue-dark)]"
              >
                تسوق الآن
              </Link>
              <Link
                href="/stores"
                className="inline-flex rounded-full border border-[var(--packora-border)] bg-white px-6 py-3 text-sm font-black text-[var(--packora-navy)] transition hover:border-[var(--packora-blue)] hover:bg-[var(--packora-light-pink)]"
              >
                تصفح المتاجر
              </Link>
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden rounded-[24px] border border-white bg-white/75 p-5 shadow-[0_18px_45px_rgba(236,72,153,0.12)]">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--packora-baby-pink)]/45" />
            <div className="absolute -bottom-14 right-8 h-36 w-36 rounded-full bg-[var(--packora-light-pink)]" />

            <div className="relative grid grid-cols-2 gap-3">
              {supplies.slice(0, 4).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-[var(--packora-border)] bg-white p-4 shadow-[0_10px_24px_rgba(236,72,153,0.08)]"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--packora-light-pink)] text-[var(--packora-blue)]">
                      <Icon size={22} />
                    </div>
                    <p className="mt-4 text-sm font-black leading-6">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
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
