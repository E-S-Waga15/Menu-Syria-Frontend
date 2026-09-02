import { AdminControlCenter } from "@/features/admin/components/control-center";
import {
  getAdminStats,
  getAdminSubscriptions,
} from "@/features/admin/services";

export default async function AdminDashboardPage() {
  const [stats, businesses] = await Promise.all([
    getAdminStats(),
    getAdminSubscriptions(),
  ]);

  return <AdminControlCenter stats={stats} businesses={businesses} />;
}
