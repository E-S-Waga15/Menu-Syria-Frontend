import { SubscribedBusinesses } from "@/features/agent-dashboard/components/subscribed-businesses";
import { fetchAgentPage } from "@/features/agent-dashboard/server";
import { getMyReferredRestaurants } from "@/features/agent-dashboard/services";

export default async function AgentRestaurantsPage({
  params,
}: PageProps<"/[lang]/agent/restaurants">) {
  const { lang } = await params;
  const restaurants = await fetchAgentPage(lang, (accessToken) =>
    getMyReferredRestaurants({ accessToken }),
  );
  return <SubscribedBusinesses businesses={restaurants} kind="restaurant" />;
}
