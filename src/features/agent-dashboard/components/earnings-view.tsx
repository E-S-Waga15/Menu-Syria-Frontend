"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CalendarDays,
  Copy,
  HandCoins,
  Hourglass,
  Link2,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/features/public-menu/lib/format";
import {
  getMyAgentProfile,
  getMyTransactions,
} from "@/features/agent-dashboard/services";
import { StatCard } from "@/features/restaurant-dashboard/components/stat-card";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { cn } from "@/lib/utils";

export function AgentEarningsView() {
  const { t, lang } = useI18n();

  const { data: agent } = useQuery({
    queryKey: queryKeys.agents.detail("me"),
    queryFn: getMyAgentProfile,
  });
  const { data: transactions } = useQuery({
    queryKey: queryKeys.agents.transactions("me"),
    queryFn: getMyTransactions,
  });

  if (!agent || !transactions) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const referralUrl = `https://menusyria.com/r/${agent.referralCode}`;

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast.success(t.common.copied);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.agent.totalEarnings}
          value={formatPrice(4850000, t.common.currency)}
          icon={Banknote}
          hint="+15%"
        />
        <StatCard
          label={t.agent.collectedCommissions}
          value={formatPrice(3600000, t.common.currency)}
          icon={HandCoins}
          accent="zest"
        />
        <StatCard
          label={t.agent.pendingCommissions}
          value={formatPrice(1250000, t.common.currency)}
          icon={Hourglass}
          accent="neutral"
        />
        <StatCard
          label={t.agent.thisMonth}
          value={formatPrice(750000, t.common.currency)}
          icon={CalendarDays}
        />
      </div>

      {/* referral link */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-berry-soft/30 p-5 dark:bg-berry-soft/20">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Link2 className="size-5" />
          </span>
          <div>
            <h2 className="font-heading font-bold">{t.agent.referralTitle}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.agent.referralBody}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <code
            className="flex-1 truncate rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold sm:max-w-64"
            dir="ltr"
          >
            {referralUrl}
          </code>
          <Button onClick={copyReferral}>
            <Copy className="size-4" />
            {t.common.copy}
          </Button>
        </div>
      </section>

      {/* transaction cards */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          {t.agent.transactions}
        </h2>
        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    tx.type === "commission"
                      ? "bg-success/10 text-success"
                      : "bg-zest-soft text-zest-soft-foreground",
                  )}
                >
                  {tx.type === "commission" ? (
                    <HandCoins className="size-4.5" />
                  ) : (
                    <Banknote className="size-4.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {tx.restaurantName[lang]}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {tx.date}
                  </p>
                </div>
              </div>
              <div className="shrink-0 space-y-1 text-end">
                <p
                  className={cn(
                    "font-bold",
                    tx.amount >= 0 ? "text-success" : "text-destructive",
                  )}
                  dir="ltr"
                >
                  {formatPrice(tx.amount, t.common.currency)}
                </p>
                <Badge
                  className={
                    tx.type === "commission"
                      ? "bg-success/10 text-success"
                      : "bg-zest-soft text-zest-soft-foreground"
                  }
                >
                  {tx.type === "commission"
                    ? t.agent.commission
                    : t.agent.payout}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
