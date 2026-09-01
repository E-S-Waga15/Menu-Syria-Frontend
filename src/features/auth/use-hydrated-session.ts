import { useSyncExternalStore } from "react";

import { useAuthStore } from "@/features/auth/store";

const subscribeHydration = (callback: () => void) =>
  useAuthStore.persist.onFinishHydration(callback);

/**
 * Reads the persisted session safely across hydration: `hydrated` stays
 * false until zustand-persist has read localStorage, so callers can avoid
 * flashing a logged-out state (or redirecting a real session away) before
 * the store catches up.
 */
export function useHydratedSession() {
  const session = useAuthStore((s) => s.session);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
  return { session, hydrated };
}
