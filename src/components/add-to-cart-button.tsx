"use client";

import { useCartStore } from "@/store/cart-store";

type Props = {
  id: string;
  name: string;
  category?: string | null;
  image?: string | null;
  price: number;
  quantity?: number;
};

export function AddToCartButton({
  id,
  name,
  category,
  image,
  price,
  quantity = 1,
}: Props) {
  const addItem = useCartStore((state) => state.addItem);

  function handleAdd() {
    addItem({
      id,
      name,
      category,
      image,
      price,
      quantity,
    });

    location.href = "/packora-1/cart";
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="w-full rounded-full bg-black py-4 text-center font-semibold text-white transition hover:bg-[#111827]"
    >
      أضف للسلة
    </button>
  );
}
