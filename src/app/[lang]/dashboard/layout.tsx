import { notFound } from "next/navigation";

import { RestaurantDashboardShell } from "@/features/restaurant-dashboard/components/shell";
import { isLocale } from "@/i18n/config";

export default async function RestaurantDashboardLayout({
  children,
  params,
}: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <RestaurantDashboardShell>{children}</RestaurantDashboardShell>
    </>
  );
}
