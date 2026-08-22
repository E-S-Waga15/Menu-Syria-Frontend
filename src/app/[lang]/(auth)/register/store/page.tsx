import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RestaurantRegisterForm } from "@/features/auth/components/restaurant-register-form";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: t.auth.storeRegTitle, description: t.auth.storeRegBody };
}

export default async function StoreRegisterPage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <RestaurantRegisterForm
      copy={{
        title: t.auth.storeRegTitle,
        body: t.auth.storeRegBody,
        nameLabel: t.auth.storeNameLabel,
        namePlaceholder: t.auth.storeNamePlaceholder,
        typeLabel: t.auth.storeTypeLabel,
      }}
    />
  );
}
