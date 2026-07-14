"use client";

import type { ReactNode } from "react";

import {
  ChartNoAxesCombined,
  LayoutDashboard,
  QrCode,
  Receipt,
  Settings,
  Table2,
  UtensilsCrossed,
} from "lucide-react";

import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/shared/dashboard-shell";
import { useI18n } from "@/i18n/client";

export function RestaurantDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { t, lang } = useI18n();
  const base = `/${lang}/dashboard`;

  const navItems: DashboardNavItem[] = [
    { href: base, label: t.dashboard.overview, icon: LayoutDashboard, exact: true },
    { href: `${base}/menu`, label: t.dashboard.myMenu, icon: UtensilsCrossed },
    { href: `${base}/orders`, label: t.dashboard.orders, icon: Receipt },
    { href: `${base}/tables`, label: t.dashboard.tables, icon: Table2 },
    { href: `${base}/analytics`, label: t.dashboard.analytics, icon: ChartNoAxesCombined },
    { href: `${base}/qr`, label: t.dashboard.qrCode, icon: QrCode },
    { href: `${base}/settings`, label: t.dashboard.settings, icon: Settings },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      title={t.dashboard.overview}
      previewHref={`/${lang}/menu/yasmeen-house`}
      previewLabel={t.dashboard.preview}
    >
      {children}
    </DashboardShell>
  );
}
