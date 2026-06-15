"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "علب طعام بلاستيكية",
    description: "جملة وقطاعي بأسعار منافسة",
    cta: "تسوق الآن",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "صحون وأكواب بلاستيكية",
    description: "مناسبة للمطاعم والكافيهات",
    cta: "عرض المنتجات",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "خصومات على الكراتين وأكياس التغليف",
    description: "شحن لجميع مناطق المملكة",
    cta: "اطلب الآن",
    href: "#products",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80",
  },
];

export function CustomerHeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  const slide = slides[activeIndex];

  return (
    <section className="px-7 pb-10 pt-8">
      <div className="overflow-hidden rounded-[34px] border border-[#BDECF6] bg-white shadow-[0_18px_44px_rgba(14,116,144,0.12)]">
        <div className="relative h-[205px] overflow-hidden bg-[#F4FDFF]">
          <Image
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover transition-opacity duration-500"
          />
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Packora
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-[1.18] text-[#0F172A]">
            {slide.title}
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            {slide.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <Link
              href={slide.href}
              className="rounded-full bg-[#F97316] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.25)]"
            >
              {slide.cta}
            </Link>

            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`الشريحة ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-8 bg-[#F97316]"
                      : "w-2 bg-[#BDECF6]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
