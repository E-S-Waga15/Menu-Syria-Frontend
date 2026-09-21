import { SubscriptionRequestsList } from "@/features/admin/components/subscription-requests-list";
import { fetchAdminPage } from "@/features/admin/server";
import { getSubscriptionRequests } from "@/features/subscription-requests/services";

export default async function SubscriptionRequestsPage({
    params,
}: PageProps<"/[lang]/admin/subscription-requests">) {
    const { lang } = await params;
    const requests = await fetchAdminPage(lang, (accessToken) =>
        getSubscriptionRequests({ accessToken }),
    );
    return <SubscriptionRequestsList initialRequests={requests} />;
}
