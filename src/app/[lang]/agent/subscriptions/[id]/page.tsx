import { notFound } from "next/navigation";

import { SubscriptionDetail } from "@/features/agent-dashboard/components/subscription-detail";
import { fetchAgentPage } from "@/features/agent-dashboard/server";
import { getReferredBusiness } from "@/features/agent-dashboard/services";

export default async function AgentSubscriptionPage({
  params,
}: PageProps<"/[lang]/agent/subscriptions/[id]">) {
  const { lang, id } = await params;
  const found = await fetchAgentPage(lang, (accessToken) =>
    getReferredBusiness(id, { accessToken }),
  );
  if (!found) notFound();

  return <SubscriptionDetail business={found.business} kind={found.kind} />;
}
