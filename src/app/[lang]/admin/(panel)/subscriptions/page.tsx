import { AdminSubscriptionsList } from "@/features/admin/components/subscriptions-list";
import { PendingSubscriptionsList } from "@/features/admin/components/pending-subscriptions-list";
import { fetchAdminPage } from "@/features/admin/server";
import { getAdminSubscriptions } from "@/features/admin/services";

export default async function AdminSubscriptionsPage({
  params,
}: PageProps<"/[lang]/admin/subscriptions">) {
  const { lang } = await params;

  const rows = await fetchAdminPage(lang, (accessToken) =>
    getAdminSubscriptions({ accessToken }),
  );

  return (
    <div className="space-y-10">
      {/* Subscriptions approved but waiting for the hand-to-hand payment. */}
      <PendingSubscriptionsList />
      <AdminSubscriptionsList rows={rows} />
    </div>
  );
}
