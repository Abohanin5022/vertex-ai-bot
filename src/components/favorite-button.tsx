"use client";

import { Heart } from "lucide-react";
import {
  type FavoriteProduct,
  useFavoritesStore,
} from "@/store/favorites-store";

export function FavoriteButton({ product }: { product: FavoriteProduct }) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));

  return (
    <button
      type="button"
      aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      aria-pressed={isFavorite}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(product);
      }}
      className={`grid h-10 w-10 place-items-center rounded-full text-xl transition ${
        isFavorite
          ? "bg-black text-white"
          : "border border-[#E5E7EB] bg-white text-[#111827]"
      }`}
    >
      <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
