"use client";

import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { useI18n } from "@/i18n/client";

/**
 * A customer's notices.
 *
 * Nothing is derived for customers yet — order updates are the natural source
 * and there is no order pipeline behind them, so this renders the empty state
 * honestly rather than inventing notices to fill the page.
 */
export function CustomerNotifications() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-display text-2xl md:text-3xl">
        {t.notifications.title}
      </h1>
      <NotificationsList notifications={[]} />
    </div>
  );
}
