"use client";

import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { buildSubscriptionNotifications } from "@/features/notifications/services";
import { useI18n } from "@/i18n/client";
import type { Restaurant, Store } from "@/lib/types";

/**
 * The agent's reminders. Derived from the subscriptions they hold, so the list
 * is a view of the same dates the business pages show — never a second copy
 * that can disagree with them.
 */
export function AgentNotifications({
  restaurants,
  stores,
}: {
  restaurants: Restaurant[];
  stores: Store[];
}) {
  const { t, lang } = useI18n();

  const notifications = buildSubscriptionNotifications(
    [...restaurants, ...stores],
    (business) => `/${lang}/agent/subscriptions/${business.id}`,
  );

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-xl font-bold">
        {t.notifications.title}
      </h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
