import { create } from "zustand";

interface UiState {
  isCartSheetOpen: boolean;
  setCartSheetOpen: (open: boolean) => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isCartSheetOpen: false,
  setCartSheetOpen: (open) => set({ isCartSheetOpen: open }),
  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
