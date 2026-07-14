import { notFound } from "next/navigation";

import { AdminAgentLedger } from "@/features/admin/components/agent-ledger";
import { isLocale } from "@/i18n/config";

export default async function AdminAgentDetailPage({
  params,
}: PageProps<"/[lang]/admin/agents/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  return <AdminAgentLedger agentId={id} />;
}
