import { AgentNotifications } from "@/features/agent-dashboard/components/agent-notifications";
import {
  getMyReferredRestaurants,
  getMyReferredStores,
} from "@/features/agent-dashboard/services";

export default async function AgentNotificationsPage() {
  const [restaurants, stores] = await Promise.all([
    getMyReferredRestaurants(),
    getMyReferredStores(),
  ]);

  return <AgentNotifications restaurants={restaurants} stores={stores} />;
}
