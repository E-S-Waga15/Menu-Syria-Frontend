"use client";

import Link from "next/link";

import { Bell } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { useNotificationsStore } from "@/stores/notifications-store";

/**
 * Header bell with an unread count.
 *
 * It is a link, not a popover: the notice list is a page in its own right
 * (reachable from the account menu too), and one destination is easier to
 * reason about than a panel that has to duplicate it.
 */
export function NotificationBell({
  href,
  ids,
}: {
  href: string;
  /** every notice currently derived for this viewer, to count what is unread */
  ids: string[];
}) {
  const { t } = useI18n();
  const readIds = useNotificationsStore((s) => s.readIds);

  const unread = ids.filter((id) => !readIds.includes(id)).length;

  return (
    <Link
      href={href}
      aria-label={t.notifications.title}
      title={t.notifications.title}
      className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -end-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums"
          aria-hidden
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
      {/* the badge is decorative; the count belongs in the accessible name */}
      <span className="sr-only">{unread}</span>
    </Link>
  );
}
