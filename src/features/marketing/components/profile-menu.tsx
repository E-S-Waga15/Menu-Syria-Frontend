"use client";

import { useRouter } from "next/navigation";

import { Bell, Heart, UserRound } from "lucide-react";

import {
  AccountMenu,
  type AccountMenuSession,
} from "@/components/shared/account-menu";
import { destinationForRole } from "@/features/auth/lib/destinations";
import { useAuthStore, type UserRole } from "@/features/auth/store";
import { useI18n } from "@/i18n/client";

interface ProfileMenuSession extends AccountMenuSession {
  role: UserRole;
}

/** Post-login navbar avatar — replaces the login dropdown + CTA once a
 * session exists. Thin wrapper around the shared `AccountMenu`, supplying
 * the customer-facing nav links (account, favorites). */
export function ProfileMenu({ session }: { session: ProfileMenuSession }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <AccountMenu
      session={session}
      navItems={[
        {
          icon: UserRound,
          label: t.nav.accountInfo,
          href: destinationForRole(lang, session.role),
        },
        { icon: Heart, label: t.nav.myFavorites, href: `/${lang}/favorites` },
        {
          icon: Bell,
          label: t.notifications.title,
          href: `/${lang}/notifications`,
        },
      ]}
      onLogout={() => {
        logout();
        router.push(`/${lang}`);
      }}
    />
  );
}

export type { ProfileMenuSession };
