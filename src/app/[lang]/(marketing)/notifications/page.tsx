import { notFound } from "next/navigation";

import { CustomerNotifications } from "@/features/marketing/components/customer-notifications";
import { isLocale } from "@/i18n/config";

export default async function NotificationsPage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <CustomerNotifications />
    </main>
  );
}
