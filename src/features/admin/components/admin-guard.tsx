"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/client";

const subscribeHydration = (callback: () => void) =>
  useAuthStore.persist.onFinishHydration(callback);

/**
 * Client gate for the platform console: anyone without an admin session
 * is bounced to /admin/login. Renders nothing until the persisted session
 * has been read, so the panel never flashes for strangers.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace(`/${lang}/admin/login`);
  }, [hydrated, isAdmin, lang, router]);

  if (!hydrated || !isAdmin) return null;
  return <>{children}</>;
}
