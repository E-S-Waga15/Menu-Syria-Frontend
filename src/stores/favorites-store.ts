import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (restaurantId) =>
        set((state) => ({
          ids: state.ids.includes(restaurantId)
            ? state.ids.filter((id) => id !== restaurantId)
            : [...state.ids, restaurantId],
        })),
      isFavorite: (restaurantId) => get().ids.includes(restaurantId),
    }),
    { name: "menu-syria-favorites" },
  ),
);
