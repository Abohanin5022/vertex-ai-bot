import { create } from "zustand";
import { persist } from "zustand/middleware";

type DesktopCartItem = {
  id: string;
  name: string;
  category?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
};

type DesktopCartStore = {
  items: DesktopCartItem[];
  addItem: (item: DesktopCartItem) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useDesktopCartStore = create<DesktopCartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((current) => current.id === item.id);

          if (existing) {
            return {
              items: state.items.map((current) =>
                current.id === item.id
                  ? { ...current, quantity: current.quantity + item.quantity }
                  : current
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      increaseItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decreaseItem: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "packora-desktop-cart",
    }
  )
);
