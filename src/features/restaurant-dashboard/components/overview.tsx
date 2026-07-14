"use client";

import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  Eye,
  Receipt,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/features/restaurant-dashboard/components/stat-card";
import {
  getMyAnalytics,
  getMyOrders,
} from "@/features/restaurant-dashboard/services";
import { formatPrice } from "@/features/public-menu/lib/format";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const RESTAURANT_ID = "r1";

export function DashboardOverview() {
  const { t, lang } = useI18n();

  const { data: analytics } = useQuery({
    queryKey: queryKeys.restaurants.analytics(RESTAURANT_ID),
    queryFn: getMyAnalytics,
  });

  const { data: orders } = useQuery({
    queryKey: queryKeys.restaurants.orders(RESTAURANT_ID),
    queryFn: getMyOrders,
  });

  if (!analytics) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const statusStyle = {
    new: "bg-berry-soft text-berry-soft-foreground",
    preparing: "bg-zest-soft text-zest-soft-foreground",
    ready: "bg-success/10 text-success",
  } as const;

  const statusLabel = {
    new: t.dashboard.newOrders,
    preparing: t.dashboard.preparing,
    ready: t.dashboard.ready,
  } as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.dashboard.todayOrders}
          value={String(analytics.todayOrders)}
          icon={Receipt}
          hint="+12%"
        />
        <StatCard
          label={t.dashboard.todayRevenue}
          value={formatPrice(analytics.todayRevenue, t.common.currency)}
          icon={Banknote}
          accent="zest"
          hint="+8%"
        />
        <StatCard
          label={t.dashboard.menuViews}
          value={analytics.menuViews.toLocaleString("en-US")}
          icon={Eye}
          accent="neutral"
        />
        <StatCard
          label={t.dashboard.avgOrder}
          value={formatPrice(analytics.avgOrderValue, t.common.currency)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* recent orders */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">
            {t.dashboard.orders}
          </h2>
          <ul className="mt-4 divide-y divide-border/60">
            {(orders ?? []).map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {fmt(t.dashboard.orderNumber, { number: order.number })}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {order.lines
                      .map((l) => `${l.quantity}× ${l.name[lang]}`)
                      .join("، ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold" dir="ltr">
                    {formatPrice(order.total, t.common.currency)}
                  </span>
                  <Badge className={statusStyle[order.status]}>
                    {statusLabel[order.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* best seller */}
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="relative h-44">
            <Image
              src={analytics.bestSeller.imageUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
            <span className="absolute start-4 top-4 rounded-full bg-zest px-3 py-1 text-xs font-bold text-zest-foreground shadow-soft">
              {t.dashboard.bestSeller}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-heading text-lg font-semibold">
              {analytics.bestSeller.name[lang]}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {analytics.bestSeller.description[lang]}
            </p>
            <p className="mt-3 text-lg font-bold text-primary" dir="ltr">
              {formatPrice(analytics.bestSeller.price, t.common.currency)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
