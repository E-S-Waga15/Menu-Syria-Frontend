import { AdminNotifications } from "@/features/admin/components/admin-notifications";
import { getAdminSubscriptions } from "@/features/admin/services";

export default async function AdminNotificationsPage() {
  const rows = await getAdminSubscriptions();
  return <AdminNotifications businesses={rows.map((r) => r.business)} />;
}
