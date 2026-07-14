"use client";

import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  getAdminAgentById,
  getAdminAgentLedger,
} from "@/features/admin/services";
import { formatPrice } from "@/features/public-menu/lib/format";
import { StatCard } from "@/features/restaurant-dashboard/components/stat-card";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { cn } from "@/lib/utils";

export function AdminAgentLedger({ agentId }: { agentId: string }) {
  const { t, lang } = useI18n();

  const { data: agent, isPending } = useQuery({
    queryKey: queryKeys.agents.detail(agentId),
    queryFn: () => getAdminAgentById(agentId),
  });
  const { data: ledger } = useQuery({
    queryKey: queryKeys.agents.transactions(agentId),
    queryFn: () => getAdminAgentLedger(agentId),
  });

  if (isPending || !ledger) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!agent) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {t.common.notFoundTitle}
      </p>
    );
  }

  const credit = ledger
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const debit = ledger
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const balance = credit - debit;

  return (
    <div className="space-y-6">
      {/* profile strip */}
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
        <Image
          src={agent.photoUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold">
            {agent.name[lang]}
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground" dir="ltr">
            {agent.phone} · {agent.referralCode}
          </p>
        </div>
        <Badge className="bg-berry-soft text-berry-soft-foreground">
          {agent.restaurantsCount} {t.home.agentRestaurantsCount}
        </Badge>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.admin.credit}
          value={formatPrice(credit, t.common.currency)}
          icon={ArrowUpCircle}
        />
        <StatCard
          label={t.admin.debit}
          value={formatPrice(debit, t.common.currency)}
          icon={ArrowDownCircle}
          accent="zest"
        />
        <StatCard
          label={t.admin.balance}
          value={formatPrice(balance, t.common.currency)}
          icon={Wallet}
        />
        <StatCard
          label={t.admin.commissionRate}
          value={`${agent.commissionRate * 100}%`}
          icon={Percent}
          accent="neutral"
        />
      </div>

      {/* ledger */}
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <h2 className="border-b border-border/60 px-5 py-4 font-heading text-lg font-semibold">
          {t.admin.agentLedger}
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
                <TableHead className="px-5 font-bold">
                  {t.agent.transactionDate}
                </TableHead>
                <TableHead className="font-bold">
                  {t.agent.transactionRestaurant}
                </TableHead>
                <TableHead className="font-bold">{t.admin.credit}</TableHead>
                <TableHead className="px-5 font-bold">
                  {t.admin.debit}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((tx, index) => (
                <TableRow
                  key={tx.id}
                  className={cn(
                    index % 2 === 1 &&
                      "bg-surface-container-low/60 dark:bg-surface-container-low/40",
                  )}
                >
                  <TableCell className="px-5 font-semibold" dir="ltr">
                    {tx.date}
                  </TableCell>
                  <TableCell>{tx.restaurantName[lang]}</TableCell>
                  <TableCell className="font-bold text-success" dir="ltr">
                    {tx.amount > 0
                      ? formatPrice(tx.amount, t.common.currency)
                      : "—"}
                  </TableCell>
                  <TableCell
                    className="px-5 font-bold text-destructive"
                    dir="ltr"
                  >
                    {tx.amount < 0
                      ? formatPrice(Math.abs(tx.amount), t.common.currency)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* payment timeline */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">
          {t.admin.paymentTimeline}
        </h2>
        <ol className="mt-5 space-y-0 border-s-2 border-border ps-5">
          {ledger.map((tx) => (
            <li key={tx.id} className="relative pb-6 last:pb-0">
              <span
                className={cn(
                  "absolute -start-[1.65rem] top-1 size-3.5 rounded-full border-2 border-card",
                  tx.amount >= 0 ? "bg-success" : "bg-zest",
                )}
              />
              <p className="text-sm font-bold" dir="ltr">
                {formatPrice(tx.amount, t.common.currency)}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {tx.restaurantName[lang]} ·{" "}
                <span dir="ltr">{tx.date}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
