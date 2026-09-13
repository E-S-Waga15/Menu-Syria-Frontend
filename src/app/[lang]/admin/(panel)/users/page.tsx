import { AdminUsersList } from "@/features/admin/components/users-list";
import { fetchAdminPage } from "@/features/admin/server";
import { getAdminUsers } from "@/features/admin/services";
import { getGovernorates } from "@/features/marketing/services";

export default async function AdminUsersPage({
  params,
}: PageProps<"/[lang]/admin/users">) {
  const { lang } = await params;

  const [users, governorates] = await Promise.all([
    fetchAdminPage(lang, (accessToken) => getAdminUsers({ accessToken })),
    getGovernorates(),
  ]);

  return <AdminUsersList users={users} governorates={governorates} />;
}
