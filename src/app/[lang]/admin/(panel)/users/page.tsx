import { AdminUsersList } from "@/features/admin/components/users-list";
import { getAdminUsers } from "@/features/admin/services";
import { getGovernorates } from "@/features/marketing/services";

export default async function AdminUsersPage() {
  const [users, governorates] = await Promise.all([
    getAdminUsers(),
    getGovernorates(),
  ]);

  return <AdminUsersList users={users} governorates={governorates} />;
}
