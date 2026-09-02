import { AdminAgentsList } from "@/features/admin/components/agents-list";
import { getAdminAgents } from "@/features/admin/services";
import { getGovernorates, getRegions } from "@/features/marketing/services";

export default async function AdminAgentsPage() {
  const [agents, governorates, regions] = await Promise.all([
    getAdminAgents(),
    getGovernorates(),
    getRegions(),
  ]);

  return (
    <AdminAgentsList
      agents={agents}
      governorates={governorates}
      regions={regions}
    />
  );
}
