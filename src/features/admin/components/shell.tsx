"use client";

import type { ReactNode } from "react";

import { LayoutDashboard, Settings2, UserRound } from "lucide-react";

import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/shared/dashboard-shell";
import { useI18n } from "@/i18n/client";

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const base = `/${lang}/admin`;

  const navItems: DashboardNavItem[] = [
    { href: base, label: t.admin.dashboard, icon: LayoutDashboard, exact: true },
    { href: `${base}/agents`, label: t.admin.agents, icon: UserRound },
    { href: `${base}/settings`, label: t.admin.systemSettings, icon: Settings2 },
  ];

  return (
    <DashboardShell navItems={navItems} title={t.admin.dashboard}>
      {children}
    </DashboardShell>
  );
}
