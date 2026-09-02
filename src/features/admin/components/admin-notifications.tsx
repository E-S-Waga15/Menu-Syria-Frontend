"use client";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { buildSubscriptionNotifications } from "@/features/notifications/services";
import { useI18n } from "@/i18n/client";
import type { Business } from "@/lib/types";

/**
 * Platform-wide reminders. Same derivation as the agent's list, pointed at the
 * console's own business pages so an admin lands where they can act.
 */
export function AdminNotifications({ businesses }: { businesses: Business[] }) {
  const { t, lang } = useI18n();

  const notifications = buildSubscriptionNotifications(
    businesses,
    (business) =>
      `/${lang}/admin/${"cuisine" in business ? "restaurants" : "stores"}/${business.id}`,
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t.notifications.title}
        count={notifications.length}
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
