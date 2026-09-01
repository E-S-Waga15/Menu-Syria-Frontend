import { SubscribedBusinesses } from "@/features/agent-dashboard/components/subscribed-businesses";
import { getMyReferredStores } from "@/features/agent-dashboard/services";

export default async function AgentStoresPage() {
  const stores = await getMyReferredStores();
  return <SubscribedBusinesses businesses={stores} kind="store" />;
}
