import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { UserProfileForm } from "@/features/auth/components/user-profile-form";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.auth.completeProfileTitle,
    description: t.auth.completeProfileBody,
  };
}

export default async function UserRegisterPage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [governorates, regions] = await Promise.all([
    getGovernorates(),
    getRegions(),
  ]);

  return (
    // useSearchParams (the phone handoff) requires a Suspense boundary
    <Suspense>
      <UserProfileForm governorates={governorates} regions={regions} />
    </Suspense>
  );
}
