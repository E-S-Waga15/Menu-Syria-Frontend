import { AdminNotifications } from "@/features/admin/components/admin-notifications";
import { fetchAdminPage } from "@/features/admin/server";
import { getAdminSubscriptions } from "@/features/admin/services";

export default async function AdminNotificationsPage({
  params,
}: PageProps<"/[lang]/admin/notifications">) {
  const { lang } = await params;

  const rows = await fetchAdminPage(lang, (accessToken) =>
    getAdminSubscriptions({ accessToken }),
  );

  return <AdminNotifications businesses={rows.map((r) => r.business)} />;
}
