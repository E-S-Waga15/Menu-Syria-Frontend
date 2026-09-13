import { AdminControlCenter } from "@/features/admin/components/control-center";
import { fetchAdminPage } from "@/features/admin/server";
import {
  getAdminStats,
  getAdminSubscriptions,
} from "@/features/admin/services";

export default async function AdminDashboardPage({
  params,
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;

  const [stats, businesses] = await Promise.all([
    fetchAdminPage(lang, (accessToken) => getAdminStats({ accessToken })),
    fetchAdminPage(lang, (accessToken) =>
      getAdminSubscriptions({ accessToken }),
    ),
  ]);

  return <AdminControlCenter stats={stats} businesses={businesses} />;
}
