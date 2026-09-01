import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationsState {
  /** ids the visitor has already seen — the notices themselves are derived */
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  isRead: (id: string) => boolean;
}

/**
 * Only the read/unread flags are stored. The notices are derived from
 * subscription dates on every load, so a reminder that stops being true stops
 * being shown — there is no stale copy of it sitting in local storage.
 */
export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      readIds: [],
      markRead: (id) =>
        set((state) =>
          state.readIds.includes(id)
            ? state
            : { readIds: [...state.readIds, id] },
        ),
      markAllRead: (ids) =>
        set((state) => ({
          readIds: [...new Set([...state.readIds, ...ids])],
        })),
      isRead: (id) => get().readIds.includes(id),
    }),
    { name: "menu-syria-notifications" },
  ),
);
