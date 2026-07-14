"use client";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminAgents } from "@/features/admin/services";
import { getGovernorates } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { SubscriptionStatus } from "@/lib/types";

export function AdminAgentsList() {
  const { t, lang } = useI18n();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  const { data: agents } = useQuery({
    queryKey: queryKeys.admin.agents,
    queryFn: getAdminAgents,
  });
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  if (!agents) {
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
    <ul className="space-y-4">
      {agents.map((agent) => (
        <li key={agent.id}>
          <Link
            href={`/${lang}/admin/agents/${agent.id}`}
            className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
          >
            <Image
              src={agent.photoUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-heading font-bold">{agent.name[lang]}</h3>
                <Badge className={statusStyle[agent.status]}>
                  {statusLabel[agent.status]}
                </Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                <span>
                  {governorates?.find((g) => g.id === agent.governorateId)
                    ?.name[lang] ?? agent.governorateId}
                </span>
                <span className="flex items-center gap-1">
                  <Store className="size-3.5" />
                  {agent.restaurantsCount} {t.home.agentRestaurantsCount}
                </span>
                <span dir="ltr">
                  {t.admin.commissionRate}: {agent.commissionRate * 100}%
                </span>
              </p>
            </div>
            <Chevron className="size-5 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
