import { AdminBusinessesList } from "@/features/admin/components/businesses-list";
import { getAdminStores } from "@/features/admin/services";
import { getGovernorates, getRegions } from "@/features/marketing/services";

export default async function AdminBusinessesPage() {
  const [businesses, governorates, regions] = await Promise.all([
    getAdminStores(),
    getGovernorates(),
    getRegions(),
  ]);

  return (
    <AdminBusinessesList
      businesses={businesses}
      governorates={governorates}
      regions={regions}
      kind="store"
    />
  );
}
