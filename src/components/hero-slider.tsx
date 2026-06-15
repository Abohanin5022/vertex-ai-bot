"use client";

import { useEffect, useState } from "react";
import { Package, Store, Truck } from "lucide-react";

const slides = [
  {
    title: "عروض الجملة",
    subtitle: "أسعار توريد ذكية للمطاعم والمتاجر",
    color: "from-[#F97316] to-[#EA580C]",
    icon: Package,
  },
  {
    title: "توصيل موثوق",
    subtitle: "شحن سريع لجميع مناطق المملكة",
    color: "from-[#2563EB] to-[#1D4ED8]",
    icon: Truck,
  },
  {
    title: "توريد احترافي",
    subtitle: "مستلزمات المطاعم والمتاجر بالجملة",
    color: "from-[#1F2937] to-[#334155]",
    icon: Store,
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br ${slide.color} p-5 text-white shadow-xl shadow-orange-200/40 transition-all duration-500`}
    >
      <div className="grid grid-cols-[1fr_112px] items-center gap-3">
        <div>
          <p className="text-sm font-bold text-white/80">Packora</p>

          <h2 className="mt-2 text-3xl font-black">{slide.title}</h2>

          <p className="mt-3 text-sm leading-6 text-white/80">
            {slide.subtitle}
          </p>

          <a
            href="#products"
            className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#1F2937]"
          >
            تسوق الآن
          </a>
        </div>

        <div className="grid h-28 place-items-center rounded-xl bg-white/10 backdrop-blur">
          <Icon size={58} strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              index === i ? "w-10 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
