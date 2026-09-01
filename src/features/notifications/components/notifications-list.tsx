"use client";

import Link from "next/link";
import { useState } from "react";

import { AlertTriangle, Bell, CalendarClock, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fmt, useI18n } from "@/i18n/client";
import type { AppNotification, NotificationKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/stores/notifications-store";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  expiringSoon: CalendarClock,
  expired: AlertTriangle,
  renewed: CheckCheck,
  joined: Bell,
};

/**
 * The notice list, shared by every dashboard and by customers.
 *
 * Unread is carried by a left edge and weight rather than a coloured row: the
 * list is read top to bottom, and tinting whole rows made the expired ones —
 * which are the urgent ones — compete with the merely unread.
 */
export function NotificationsList({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const { t, lang } = useI18n();
  const readIds = useNotificationsStore((s) => s.readIds);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const isRead = (id: string) => readIds.includes(id);
  const unreadCount = notifications.filter((n) => !isRead(n.id)).length;

  const shown = unreadOnly
    ? notifications.filter((n) => !isRead(n.id))
    : notifications;

  const messageFor = (notification: AppNotification) => {
    const values = {
      name: notification.subjectName[lang],
      days: String(notification.days ?? 0),
    };
    switch (notification.kind) {
      case "expired":
        return fmt(t.notifications.expiredNotice, values);
      case "renewed":
        return fmt(t.notifications.renewedNotice, values);
      case "joined":
        return fmt(t.notifications.joinedNotice, values);
      default:
        return fmt(t.notifications.expiringSoon, values);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-14 text-center">
        <Bell className="mx-auto size-10 text-muted-foreground/40" />
        <p className="mt-3 font-semibold">{t.notifications.empty}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.notifications.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: false, label: t.notifications.filterAll },
              { value: true, label: t.notifications.filterUnread },
            ] as const
          ).map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setUnreadOnly(filter.value)}
              aria-pressed={unreadOnly === filter.value}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200",
                unreadOnly === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-container text-foreground/70 hover:bg-surface-container-high",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead(notifications.map((n) => n.id))}
          >
            <CheckCheck className="size-4" />
            {t.notifications.markAllRead}
          </Button>
        )}
      </div>

      <ul className="space-y-2.5">
        {shown.map((notification) => {
          const Icon = KIND_ICON[notification.kind];
          const read = isRead(notification.id);
          const urgent = notification.kind === "expired";

          const body = (
            <>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  urgent
                    ? "bg-destructive/10 text-destructive"
                    : "bg-berry-soft text-berry-soft-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm",
                    read ? "font-medium text-muted-foreground" : "font-bold",
                  )}
                >
                  {messageFor(notification)}
                </span>
              </span>
              {!read && (
                <span
                  aria-hidden
                  className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                />
              )}
            </>
          );

          const className = cn(
            "flex w-full items-start gap-3 rounded-2xl border border-border/60 border-s-2 bg-card p-3.5 text-start transition-colors duration-200 hover:border-primary/35",
            read
              ? "border-s-border"
              : urgent
                ? "border-s-destructive"
                : "border-s-primary",
          );

          return (
            <li key={notification.id}>
              {notification.href ? (
                <Link
                  href={notification.href}
                  onClick={() => markRead(notification.id)}
                  className={className}
                >
                  {body}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className={cn(className, "cursor-pointer")}
                >
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
