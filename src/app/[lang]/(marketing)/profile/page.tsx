import { notFound } from "next/navigation";

import { CustomerProfile } from "@/features/customer/components/customer-profile";
import { isLocale } from "@/i18n/config";

export default async function ProfilePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <CustomerProfile />
    </main>
  );
}
