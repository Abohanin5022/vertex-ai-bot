"use client";

import { useMemo, useState } from "react";
import { Price } from "@/components/price";
import { useCartStore } from "@/store/cart-store";

type ConfiguratorProduct = {
  id: string;
  name: string;
  category?: string | null;
  price: number;
};

type Option = {
  label: string;
  price: number;
};

const sizes: Option[] = [
  { label: "صغير", price: 0 },
  { label: "وسط", price: 8 },
  { label: "كبير", price: 15 },
];

const materials: Option[] = [
  { label: "بلاستيك شفاف", price: 0 },
  { label: "بلاستيك أبيض", price: 5 },
  { label: "بلاستيك أسود", price: 7 },
  { label: "قابل للتحمل", price: 12 },
];

const quantities = [50, 100, 250, 500, 1000];

const defaultProduct: ConfiguratorProduct = {
  id: "plastic-box",
  name: "علب تغليف بلاستيك",
  category: "تغليف",
  price: 0.75,
};

export function ProductConfigurator({
  product = defaultProduct,
}: {
  product?: ConfiguratorProduct;
}) {
  const [size, setSize] = useState(sizes[1]);
  const [material, setMaterial] = useState(materials[0]);
  const [quantity, setQuantity] = useState(100);
  const [printing, setPrinting] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const total = useMemo(() => {
    const printingCost = printing ? 0.25 : 0;
    return Math.round(
      quantity * (product.price + printingCost) +
        size.price +
        material.price
    );
  }, [quantity, size, material, printing, product.price]);

  return (
    <section
      dir="rtl"
      className="rounded-[28px] border border-[var(--packora-border)] bg-white p-5"
    >
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-semibold text-[var(--packora-blue)]">
            تخصيص المنتج
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[var(--packora-navy)]">
            {product.name}
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            اختر المقاس، المادة، الكمية، والطباعة ليظهر السعر مباشرة.
          </p>

          <div className="mt-6 grid gap-5">
            <OptionGroup
              title="المقاس"
              options={sizes}
              selected={size.label}
              onSelect={setSize}
            />

            <OptionGroup
              title="المادة"
              options={materials}
              selected={material.label}
              onSelect={setMaterial}
            />

            <div>
              <h3 className="mb-3 font-bold text-[var(--packora-navy)]">
                الكمية
              </h3>

              <div className="flex flex-wrap gap-2">
                {quantities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuantity(item)}
                    className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                      quantity === item
                        ? "border-[var(--packora-blue)] bg-[var(--packora-blue)] text-white"
                        : "border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] text-[var(--packora-navy)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-cyan-soft)] p-4">
              <div>
                <p className="font-bold text-[var(--packora-navy)]">
                  إضافة طباعة شعار
                </p>

                <p className="text-sm text-[#6B7280]">
                  رفع تصميم أو شعار للطلب
                </p>
              </div>

              <input
                type="checkbox"
                checked={printing}
                onChange={(event) => setPrinting(event.target.checked)}
                className="h-5 w-5 accent-[var(--packora-blue)]"
              />
            </label>

            {printing && (
              <div className="rounded-[22px] border-2 border-dashed border-[var(--packora-orange)] bg-[var(--packora-cyan-soft)] p-6 text-center">
                <p className="font-bold text-[var(--packora-navy)]">
                  ارفع التصميم هنا
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  PNG / PDF / AI / PSD
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[24px] bg-[var(--packora-navy)] p-5 text-white">
          <p className="text-sm text-white/70">ملخص الطلب</p>

          <div className="mt-5 grid gap-3 text-sm">
            <Summary label="المنتج" value={product.name} />
            <Summary label="التصنيف" value={product.category ?? "منتج"} />
            <Summary label="المقاس" value={size.label} />
            <Summary label="المادة" value={material.label} />
            <Summary label="الكمية" value={`${quantity} حبة`} />
            <Summary
              label="الطباعة"
              value={printing ? "مع طباعة" : "بدون طباعة"}
            />
          </div>

          <div className="my-6 h-px bg-white/10" />

          <p className="text-sm text-white/70">السعر التقديري</p>

          <div className="mt-2">
            <Price
              amount={total}
              className="text-4xl font-black text-white"
              iconClassName="h-7 w-7 brightness-0 invert"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: Number((total / quantity).toFixed(2)),
                quantity,
              })
            }
            className="mt-6 w-full rounded-full bg-[var(--packora-orange)] py-4 font-bold text-white hover:bg-[var(--packora-orange-dark)]"
          >
            أضف للسلة
          </button>

          <button className="mt-3 w-full rounded-full bg-white py-4 font-bold text-[var(--packora-navy)]">
            طلب عرض سعر
          </button>
        </aside>
      </div>
    </section>
  );
}

function OptionGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: Option[];
  selected: string;
  onSelect: (option: Option) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-bold text-[var(--packora-navy)]">{title}</h3>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border px-4 py-3 text-right text-sm font-semibold transition ${
              selected === option.label
                ? "border-[var(--packora-blue)] bg-[var(--packora-cyan)] text-[var(--packora-blue)]"
                : "border-[var(--packora-border)] bg-white text-[#6B7280]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-white/70">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
