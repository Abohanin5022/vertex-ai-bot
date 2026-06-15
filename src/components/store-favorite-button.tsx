"use client";

import { Heart } from "lucide-react";
import {
  type FavoriteStore,
  useFavoritesStore,
} from "@/store/favorites-store";

export function StoreFavoriteButton({ store }: { store: FavoriteStore }) {
  const toggleStoreFavorite = useFavoritesStore(
    (state) => state.toggleStoreFavorite
  );
  const isFavorite = useFavoritesStore((state) =>
    state.isStoreFavorite(store.id)
  );

  return (
    <button
      type="button"
      onClick={() => toggleStoreFavorite(store)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        isFavorite
          ? "border-[var(--packora-navy)] bg-[var(--packora-navy)] text-white"
          : "border-[var(--packora-border)] bg-white text-[var(--packora-navy)] hover:border-[var(--packora-blue)]"
      }`}
    >
      <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
      {isFavorite ? "محفوظ" : "حفظ المتجر"}
    </button>
  );
}
