import type { Locale } from "@/i18n/config";
import type { UserRole } from "@/features/auth/store";

export function destinationForRole(lang: Locale, role: UserRole): string {
  switch (role) {
    case "user":
      return `/${lang}/profile`;
    case "owner":
      return `/${lang}/dashboard`;
    case "agent":
      return `/${lang}/agent`;
    case "waiter":
      return `/${lang}/dashboard/orders`;
    case "admin":
      return `/${lang}/admin`;
  }
}
