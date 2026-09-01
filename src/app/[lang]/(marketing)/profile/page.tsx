import { notFound } from "next/navigation";

import { CustomerProfile } from "@/features/auth/components/customer-profile";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function ProfilePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main className="container-page flex min-h-[70dvh] items-center justify-center pt-28 pb-20 md:pt-32">
      <CustomerProfile lang={lang} t={t} />
    </main>
  );
}
