"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useHydratedSession } from "@/features/auth/use-hydrated-session";
import { useI18n } from "@/i18n/client";

/**
 * Client gate for the platform console: anyone without an admin session
 * is bounced to /admin/login. Renders nothing until the persisted session
 * has been read, so the panel never flashes for strangers.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const router = useRouter();
  const { session, hydrated } = useHydratedSession();

  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace(`/${lang}/admin/login`);
  }, [hydrated, isAdmin, lang, router]);

  if (!hydrated || !isAdmin) return null;
  return <>{children}</>;
}
