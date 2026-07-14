import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MenuItem, MenuItemOption } from "@/lib/types";

export interface CartLine {
  /** item id + selected option ids — lines with different options stay separate */
  key: string;
  item: MenuItem;
  options: MenuItemOption[];
  quantity: number;
}

const lineKey = (itemId: string, options: MenuItemOption[]) =>
  `${itemId}|${options
    .map((o) => o.id)
    .sort()
    .join(",")}`;

export const lineUnitPrice = (line: CartLine) =>
  line.item.price + line.options.reduce((sum, o) => sum + o.priceDelta, 0);

interface CartState {
  /** Carts are kept per restaurant so scanning a second QR never mixes orders */
  restaurantId: string | null;
  lines: CartLine[];
  addItem: (
    restaurantId: string,
    item: MenuItem,
    options?: MenuItemOption[],
    quantity?: number,
  ) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      restaurantId: null,
      lines: [],

      addItem: (restaurantId, item, options = [], quantity = 1) =>
        set((state) => {
          // Switching restaurants starts a fresh cart
          const lines =
            state.restaurantId === restaurantId ? state.lines : [];
          const key = lineKey(item.id, options);
          const existing = lines.find((l) => l.key === key);
          return {
            restaurantId,
            lines: existing
              ? lines.map((l) =>
                  l.key === key
                    ? { ...l, quantity: l.quantity + quantity }
                    : l,
                )
              : [...lines, { key, item, options, quantity }],
          };
        }),

      removeLine: (key) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.key !== key),
        })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) =>
                  l.key === key ? { ...l, quantity } : l,
                ),
        })),

      clear: () => set({ lines: [], restaurantId: null }),
    }),
    { name: "menu-syria-cart", version: 2 },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.lines.reduce((sum, l) => sum + l.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.lines.reduce((sum, l) => sum + l.quantity * lineUnitPrice(l), 0);
