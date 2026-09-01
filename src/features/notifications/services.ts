import type { AppNotification, Business } from "@/lib/types";

/** inside this window a subscription is worth warning about */
const EXPIRING_WINDOW_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** whole days from today to `iso`; negative once the date has passed */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = new Date(iso).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.round((target - today) / DAY_MS);
}

/**
 * Builds the notice list from the businesses themselves rather than storing
 * notifications as records.
 *
 * A subscription reminder is a fact about a date, not an event: derive it and
 * it is always true, whereas a stored row keeps warning about an expiry that
 * was renewed last week. The read flags live separately, keyed by an id that
 * is stable for the same business and the same fact.
 */
export function buildSubscriptionNotifications(
  businesses: Business[],
  basePath: (business: Business) => string,
  now: Date = new Date(),
): AppNotification[] {
  return (
    businesses
      .flatMap<AppNotification>((business) => {
        const days = daysUntil(business.planExpiresAt, now);
        const shared = {
          subjectName: business.name,
          createdAt: business.planExpiresAt,
          href: basePath(business),
        };

        if (days < 0) {
          return [
            {
              ...shared,
              id: `expired-${business.id}-${business.planExpiresAt}`,
              kind: "expired",
              days: Math.abs(days),
            },
          ];
        }

        if (days <= EXPIRING_WINDOW_DAYS) {
          return [
            {
              ...shared,
              id: `expiring-${business.id}-${business.planExpiresAt}`,
              kind: "expiringSoon",
              days,
            },
          ];
        }

        return [];
      })
      // soonest first: an expired subscription outranks one with three weeks left
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
  );
}
