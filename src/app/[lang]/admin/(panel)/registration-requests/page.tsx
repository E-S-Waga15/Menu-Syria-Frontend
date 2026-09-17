import { RegistrationRequestsList } from "@/features/admin/components/registration-requests-list";
import { fetchAdminPage } from "@/features/admin/server";
import { getRegistrationRequests } from "@/features/admin/services";

export default async function RegistrationRequestsPage({
    params,
}: PageProps<"/[lang]/admin/registration-requests">) {
    const { lang } = await params;
    const requests = await fetchAdminPage(lang, (accessToken) =>
        getRegistrationRequests({ accessToken }),
    );
    return <RegistrationRequestsList initialRequests={requests} />;
}