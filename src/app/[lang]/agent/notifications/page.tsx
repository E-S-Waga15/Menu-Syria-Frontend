import { AgentNotifications } from "@/features/agent-dashboard/components/agent-notifications";
import { fetchAgentPage } from "@/features/agent-dashboard/server";
import {
  getMyReferredRestaurants,
  getMyReferredStores,
} from "@/features/agent-dashboard/services";

export default async function AgentNotificationsPage({
  params,
}: PageProps<"/[lang]/agent/notifications">) {
  const { lang } = await params;
  const [restaurants, stores] = await Promise.all([
    fetchAgentPage(lang, (accessToken) =>
      getMyReferredRestaurants({ accessToken }),
    ),
    fetchAgentPage(lang, (accessToken) => getMyReferredStores({ accessToken })),
  ]);

  return <AgentNotifications restaurants={restaurants} stores={stores} />;
}
