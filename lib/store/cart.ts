import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Coffee } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (coffee: Coffee) => void;
  removeItem: (coffeeId: string) => void;
  updateQuantity: (coffeeId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (coffee: Coffee) => {
        const items = get().items;
        const existing = items.find((i) => i.coffee.id === coffee.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.coffee.id === coffee.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { coffee, quantity: 1 }] });
        }
      },

      removeItem: (coffeeId: string) => {
        set({ items: get().items.filter((i) => i.coffee.id !== coffeeId) });
      },

      updateQuantity: (coffeeId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(coffeeId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.coffee.id === coffeeId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.coffee.price * i.quantity,
          0
        ),
    }),
    {
      name: "brew-co-cart",
    }
  )
);
