import { AdminPlansList } from "@/features/admin/components/plans-list";
import { fetchAdminPage } from "@/features/admin/server";
import { getAdminPlans } from "@/features/admin/services";

export default async function AdminPlansPage({
  params,
}: PageProps<"/[lang]/admin/plans">) {
  const { lang } = await params;

  const plans = await fetchAdminPage(lang, (accessToken) =>
    getAdminPlans({ accessToken }),
  );

  return <AdminPlansList plans={plans} />;
}
