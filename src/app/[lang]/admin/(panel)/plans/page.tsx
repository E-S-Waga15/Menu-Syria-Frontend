import { AdminPlansList } from "@/features/admin/components/plans-list";
import { getAdminPlans } from "@/features/admin/services";

export default async function AdminPlansPage() {
  const plans = await getAdminPlans();
  return <AdminPlansList plans={plans} />;
}
