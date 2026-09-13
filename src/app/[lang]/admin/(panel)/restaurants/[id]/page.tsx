import { notFound } from "next/navigation";

import { AdminBusinessDetail } from "@/features/admin/components/business-detail";
import { fetchAdminPage } from "@/features/admin/server";
import { getAdminBusiness } from "@/features/admin/services";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";

export default async function AdminBusinessPage({
  params,
}: PageProps<"/[lang]/admin/restaurants/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const [found, governorates, regions] = await Promise.all([
    fetchAdminPage(lang, (accessToken) => getAdminBusiness(id, { accessToken })),
    getGovernorates(),
    getRegions(),
  ]);
  if (!found) notFound();

  return (
    <AdminBusinessDetail
      business={found.business}
      kind={found.kind}
      governorateName={
        governorates.find((g) => g.id === found.business.governorateId)?.name[
          lang
        ] ?? ""
      }
      regionName={
        regions.find((r) => r.id === found.business.regionId)?.name[lang] ?? ""
      }
    />
  );
}
