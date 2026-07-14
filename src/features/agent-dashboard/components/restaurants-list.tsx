"use client";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyReferredRestaurants } from "@/features/agent-dashboard/services";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { SubscriptionStatus } from "@/lib/types";

export function AgentRestaurantsList() {
  const { t, lang } = useI18n();

  const { data: restaurants } = useQuery({
    queryKey: queryKeys.restaurants.all,
    queryFn: getMyReferredRestaurants,
  });

  if (!restaurants) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  const statusStyle: Record<SubscriptionStatus, string> = {
    active: "bg-success/10 text-success",
    expired: "bg-destructive/10 text-destructive",
    pending: "bg-zest-soft text-zest-soft-foreground",
  };

  const statusLabel: Record<SubscriptionStatus, string> = {
    active: t.common.active,
    expired: t.common.expired,
    pending: t.common.pending,
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="font-semibold">
          <Plus className="size-4" />
          {t.agent.addRestaurant}
        </Button>
      </div>

      <ul className="space-y-4">
        {restaurants.map((restaurant) => (
          <li
            key={restaurant.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/30"
          >
            <Image
              src={restaurant.logoUrl}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-2xl border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-heading font-bold">
                  {restaurant.name[lang]}
                </h3>
                <Badge className={statusStyle[restaurant.status]}>
                  {statusLabel[restaurant.status]}
                </Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-zest text-zest" />
                  {restaurant.rating}
                </span>
                <span>{restaurant.cuisine[lang]}</span>
                <span className="flex items-center gap-1" dir="ltr">
                  <CalendarClock className="size-3.5" />
                  {fmt(t.agent.subscriptionEnds, {
                    date: restaurant.planExpiresAt,
                  })}
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-semibold"
              render={
                <Link href={`/${lang}/restaurants/${restaurant.slug}`} />
              }
            >
              <ExternalLink className="size-3.5" />
              {t.common.viewAll}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
