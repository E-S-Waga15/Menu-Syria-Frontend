import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning" | "default";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastItem[];
  show: (item: ToastItem) => void;
  hide: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (item) => set((s) => ({ toasts: [...s.toasts, item] })),
  hide: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
