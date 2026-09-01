"use client";

import { BadgeCheck } from "lucide-react";

import { useI18n } from "@/i18n/client";

/**
 * Context above the shared registration form when an agent opens it: the same
 * form customers use, but signed up on the agent's behalf.
 */
export function AgentRegisterIntro({ kind }: { kind: "restaurant" | "store" }) {
  const { t } = useI18n();

  return (
    <p className="flex items-start gap-2.5 rounded-2xl border border-border/60 border-s-2 border-s-primary bg-card p-4 text-sm font-semibold">
      <BadgeCheck className="size-5 shrink-0 text-primary" />
      {kind === "restaurant"
        ? t.agent.registerRestaurantHint
        : t.agent.registerStoreHint}
    </p>
  );
}
