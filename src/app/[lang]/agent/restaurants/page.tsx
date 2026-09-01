import { SubscribedBusinesses } from "@/features/agent-dashboard/components/subscribed-businesses";
import { getMyReferredRestaurants } from "@/features/agent-dashboard/services";

export default async function AgentRestaurantsPage() {
  const restaurants = await getMyReferredRestaurants();
  return <SubscribedBusinesses businesses={restaurants} kind="restaurant" />;
}
