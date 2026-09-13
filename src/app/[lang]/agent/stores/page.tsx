import { SubscribedBusinesses } from "@/features/agent-dashboard/components/subscribed-businesses";
import { fetchAgentPage } from "@/features/agent-dashboard/server";
import { getMyReferredStores } from "@/features/agent-dashboard/services";

export default async function AgentStoresPage({
  params,
}: PageProps<"/[lang]/agent/stores">) {
  const { lang } = await params;
  const stores = await fetchAgentPage(lang, (accessToken) =>
    getMyReferredStores({ accessToken }),
  );
  return <SubscribedBusinesses businesses={stores} kind="store" />;
}
