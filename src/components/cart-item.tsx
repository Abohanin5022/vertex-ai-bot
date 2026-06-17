import { Minus, Plus, Trash2 } from "lucide-react";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";

type CartItemData = {
  id: string;
  name: string;
  category?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
};

export function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItemData;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const lineTotal = item.price * item.quantity;

  return (
    <article className="rounded-[24px] border border-[var(--packora-border)] bg-white p-4 shadow-[0_14px_34px_rgba(236,72,153,0.07)]">
      <div className="grid grid-cols-[112px_1fr] gap-4">
        <div className="grid h-32 place-items-center overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#FFFFFF,#FDF2F8)]">
          <ProductImage
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain p-3"
            fallbackClassName="grid h-full w-full place-items-center rounded-[22px] border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] text-[#9CA3AF]"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-[11px] font-bold text-[var(--packora-blue)]">
                {item.category || "منتج"}
              </p>
              <h2 className="mt-1 line-clamp-2 text-base font-black leading-6 text-[var(--packora-navy)]">
                {item.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
              aria-label="حذف المنتج"
            >
              <Trash2 size={17} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-full border border-[var(--packora-border)] bg-[var(--packora-soft-pink)] p-1">
              <button
                type="button"
                onClick={() => onDecrease(item.id)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--packora-navy)] shadow-sm"
                aria-label="إنقاص الكمية"
              >
                <Minus size={16} />
              </button>

              <span className="min-w-11 text-center text-sm font-black text-[var(--packora-navy)]">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item.id)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[var(--packora-blue)] text-white shadow-sm"
                aria-label="زيادة الكمية"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="text-left">
              <p className="text-[11px] font-semibold text-[var(--packora-muted)]">
                الإجمالي
              </p>
              <Price
                amount={lineTotal}
                className="text-lg font-black text-[var(--packora-blue)]"
                iconClassName="h-4 w-4"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
