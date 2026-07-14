"use client";

import type { ReactNode } from "react";

import { LayoutDashboard, Store } from "lucide-react";

import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/shared/dashboard-shell";
import { useI18n } from "@/i18n/client";

export function AgentDashboardShell({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const base = `/${lang}/agent`;

  const navItems: DashboardNavItem[] = [
    { href: base, label: t.agent.earnings, icon: LayoutDashboard, exact: true },
    { href: `${base}/restaurants`, label: t.agent.myRestaurants, icon: Store },
  ];

  return (
    <DashboardShell navItems={navItems} title={t.agent.dashboard}>
      {children}
    </DashboardShell>
  );
}
