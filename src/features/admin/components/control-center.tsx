"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Ban,
  CircleCheck,
  CreditCard,
  MoreHorizontal,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminRestaurants,
  getAdminStats,
} from "@/features/admin/services";
import { getGovernorates } from "@/features/marketing/services";
import { formatPrice } from "@/features/public-menu/lib/format";
import { StatCard } from "@/features/restaurant-dashboard/components/stat-card";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { SubscriptionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "all";

export function AdminControlCenter() {
  const { t, lang } = useI18n();

  const { data: stats } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: getAdminStats,
  });
  const { data: restaurants } = useQuery({
    queryKey: queryKeys.admin.restaurants,
    queryFn: getAdminRestaurants,
  });
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  const [statusFilter, setStatusFilter] = useState(ALL);
  const [governorateFilter, setGovernorateFilter] = useState(ALL);

  const statusLabel: Record<SubscriptionStatus, string> = {
    active: t.common.active,
    expired: t.common.expired,
    pending: t.common.pending,
  };

  const statusStyle: Record<SubscriptionStatus, string> = {
    active: "bg-success/10 text-success",
    expired: "bg-destructive/10 text-destructive",
    pending: "bg-zest-soft text-zest-soft-foreground",
  };

  const filtered = useMemo(
    () =>
      (restaurants ?? []).filter(
        (r) =>
          (statusFilter === ALL || r.status === statusFilter) &&
          (governorateFilter === ALL || r.governorateId === governorateFilter),
      ),
    [restaurants, statusFilter, governorateFilter],
  );

  if (!stats || !restaurants) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const governorateName = (id: string) =>
    governorates?.find((g) => g.id === id)?.name[lang] ?? id;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.admin.totalRestaurants}
          value={stats.totalRestaurants.toLocaleString("en-US")}
          icon={Store}
        />
        <StatCard
          label={t.admin.totalAgents}
          value={stats.totalAgents.toLocaleString("en-US")}
          icon={UserRound}
          accent="neutral"
        />
        <StatCard
          label={t.admin.monthlyRevenue}
          value={formatPrice(stats.monthlyRevenue, t.common.currency)}
          icon={TrendingUp}
          accent="zest"
          hint="+21%"
        />
        <StatCard
          label={t.admin.activeSubscriptions}
          value={stats.activeSubscriptions.toLocaleString("en-US")}
          icon={CreditCard}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">
            {t.admin.restaurants}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => v && setStatusFilter(v)}
              items={{
                [ALL]: t.admin.filterByStatus,
                active: t.common.active,
                expired: t.common.expired,
                pending: t.common.pending,
              }}
            >
              <SelectTrigger className="h-9 min-w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t.admin.filterByStatus}</SelectItem>
                <SelectItem value="active">{t.common.active}</SelectItem>
                <SelectItem value="expired">{t.common.expired}</SelectItem>
                <SelectItem value="pending">{t.common.pending}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={governorateFilter}
              onValueChange={(v) => v && setGovernorateFilter(v)}
              items={{
                [ALL]: t.admin.filterByGovernorate,
                ...Object.fromEntries(
                  (governorates ?? []).map((g) => [g.id, g.name[lang]]),
                ),
              }}
            >
              <SelectTrigger className="h-9 min-w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>
                  {t.admin.filterByGovernorate}
                </SelectItem>
                {(governorates ?? []).map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name[lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
                <TableHead className="px-5 font-bold">
                  {t.admin.restaurants}
                </TableHead>
                <TableHead className="font-bold">
                  {t.admin.filterByGovernorate}
                </TableHead>
                <TableHead className="font-bold">
                  {t.admin.filterByStatus}
                </TableHead>
                <TableHead className="font-bold" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((restaurant, index) => (
                <TableRow
                  key={restaurant.id}
                  className={cn(
                    index % 2 === 1 &&
                      "bg-surface-container-low/60 dark:bg-surface-container-low/40",
                  )}
                >
                  <TableCell className="px-5">
                    <span className="flex items-center gap-3">
                      <Image
                        src={restaurant.logoUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-lg object-cover"
                      />
                      <span className="font-semibold">
                        {restaurant.name[lang]}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {governorateName(restaurant.governorateId)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyle[restaurant.status]}>
                      {statusLabel[restaurant.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="⋯"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toast.success(t.common.done)}
                        >
                          <CircleCheck className="size-4" />
                          {t.admin.upgradePlan}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => toast.success(t.common.done)}
                        >
                          <Ban className="size-4" />
                          {t.admin.banAccount}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
