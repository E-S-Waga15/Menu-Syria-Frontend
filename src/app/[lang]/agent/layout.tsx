import { notFound } from "next/navigation";

import { AgentDashboardShell } from "@/features/agent-dashboard/components/shell";
import { fetchAgentPage } from "@/features/agent-dashboard/server";
import {
  getMyReferredRestaurants,
  getMyReferredStores,
} from "@/features/agent-dashboard/services";
import { isLocale } from "@/i18n/config";

export default async function AgentLayout({
  children,
  params,
}: LayoutProps<"/[lang]/agent">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // fetched here rather than per page: the bell sits in the shell, so its
  // count has to be right on every agent screen, not just the list ones
  const [restaurants, stores] = await Promise.all([
    fetchAgentPage(lang, (accessToken) =>
      getMyReferredRestaurants({ accessToken }),
    ),
    fetchAgentPage(lang, (accessToken) => getMyReferredStores({ accessToken })),
  ]);

  return (
    <AgentDashboardShell businesses={[...restaurants, ...stores]}>
      {children}
    </AgentDashboardShell>
  );
}
