import { notFound } from "next/navigation";

import { AdminDashboardShell } from "@/features/admin/components/shell";
import { isLocale } from "@/i18n/config";

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </>
  );
}
