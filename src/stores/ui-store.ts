import { create } from "zustand";
import { persist } from "zustand/middleware";

/** how the catalogue manager lays its items out */
export type CatalogView = "list" | "grid";

interface UiState {
  isCartSheetOpen: boolean;
  setCartSheetOpen: (open: boolean) => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  /**
   * Remembered across visits. Persisted here rather than read from
   * localStorage in an effect: zustand-persist rehydrates on the client
   * without a synchronous setState during render, which is both the pattern
   * the rest of the stores use and the one the lint rules allow.
   */
  catalogView: CatalogView;
  setCatalogView: (view: CatalogView) => void;
  /** the agent's book of business — its own preference, since browsing
   * subscriptions and editing a menu are different jobs */
  agentListView: CatalogView;
  setAgentListView: (view: CatalogView) => void;
  /** the console's directory pages */
  adminListView: CatalogView;
  setAdminListView: (view: CatalogView) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isCartSheetOpen: false,
      setCartSheetOpen: (open) => set({ isCartSheetOpen: open }),
      isMobileNavOpen: false,
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
      catalogView: "list",
      setCatalogView: (view) => set({ catalogView: view }),
      agentListView: "grid",
      setAgentListView: (view) => set({ agentListView: view }),
      adminListView: "grid",
      setAdminListView: (view) => set({ adminListView: view }),
    }),
    {
      name: "menu-syria-ui",
      // sheet/nav open state is per-visit; only the layout choice is worth keeping
      partialize: (state) => ({
        catalogView: state.catalogView,
        agentListView: state.agentListView,
        adminListView: state.adminListView,
      }),
    },
  ),
);
