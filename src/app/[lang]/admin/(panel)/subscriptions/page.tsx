import { AdminSubscriptionsList } from "@/features/admin/components/subscriptions-list";
import { getAdminSubscriptions } from "@/features/admin/services";

export default async function AdminSubscriptionsPage() {
  const rows = await getAdminSubscriptions();
  return <AdminSubscriptionsList rows={rows} />;
}
