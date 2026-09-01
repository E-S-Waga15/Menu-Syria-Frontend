"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { buildSubscriptionNotifications } from "@/features/notifications/services";
import { getMyRestaurant } from "@/features/restaurant-dashboard/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * An owner's notices, about their own subscription rather than a book of them.
 * Same derivation as the agent's list, pointed at settings instead — that is
 * where an owner acts on a plan.
 */
export function BusinessNotifications() {
  const { t, lang } = useI18n();

  const { data: business } = useQuery({
    queryKey: queryKeys.restaurants.detail("yasmeen-house"),
    queryFn: getMyRestaurant,
  });

  if (!business) return <Skeleton className="h-64 rounded-2xl" />;

  const notifications = buildSubscriptionNotifications(
    [business],
    () => `/${lang}/dashboard/settings`,
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
