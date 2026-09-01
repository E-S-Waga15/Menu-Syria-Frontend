import { notFound } from "next/navigation";

import { SubscriptionDetail } from "@/features/agent-dashboard/components/subscription-detail";
import { getReferredBusiness } from "@/features/agent-dashboard/services";

export default async function AgentSubscriptionPage({
  params,
}: PageProps<"/[lang]/agent/subscriptions/[id]">) {
  const { id } = await params;
  const found = await getReferredBusiness(id);
  if (!found) notFound();

  return <SubscriptionDetail business={found.business} kind={found.kind} />;
}
