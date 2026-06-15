import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavoriteProduct = {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  image?: string | null;
};

export type FavoriteStore = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  city?: string | null;
  rating?: number;
  productCount?: number;
};

type FavoritesStore = {
  items: FavoriteProduct[];
  storeItems: FavoriteStore[];
  toggleFavorite: (item: FavoriteProduct) => void;
  toggleStoreFavorite: (item: FavoriteStore) => void;
  isFavorite: (id: string) => boolean;
  isStoreFavorite: (id: string) => boolean;
};

function isCompleteFavorite(
  item: Partial<FavoriteProduct>
): item is FavoriteProduct {
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number"
  );
}

function isCompleteStore(item: Partial<FavoriteStore>): item is FavoriteStore {
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string"
  );
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeItems: [],

      toggleFavorite: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);

          if (exists) {
            return {
              items: state.items.filter((i) => i.id !== item.id),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                image: item.image || null,
              },
            ],
          };
        }),

      toggleStoreFavorite: (item) =>
        set((state) => {
          const exists = state.storeItems.find((store) => store.id === item.id);

          if (exists) {
            return {
              storeItems: state.storeItems.filter(
                (store) => store.id !== item.id
              ),
            };
          }

          return {
            storeItems: [
              ...state.storeItems,
              {
                ...item,
                logo: item.logo || null,
                city: item.city || null,
              },
            ],
          };
        }),

      isFavorite: (id) => {
        return !!get().items.find((item) => item.id === id);
      },

      isStoreFavorite: (id) => {
        return !!get().storeItems.find((store) => store.id === id);
      },
    }),
    {
      name: "packora-favorites",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as {
          items?: Partial<FavoriteProduct>[];
          storeItems?: Partial<FavoriteStore>[];
        };

        return {
          items: (state.items || []).filter(isCompleteFavorite),
          storeItems: (state.storeItems || []).filter(isCompleteStore),
        };
      },
    }
  )
);
