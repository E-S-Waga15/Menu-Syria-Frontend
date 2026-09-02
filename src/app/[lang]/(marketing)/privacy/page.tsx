import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/features/marketing/components/legal-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return {
    title: t.legal.privacy.metaTitle,
    description: t.legal.privacy.metaDescription,
    alternates: alternatesFor(lang, "/privacy"),
    openGraph: {
      title: t.legal.privacy.metaTitle,
      description: t.legal.privacy.metaDescription,
    },
    twitter: {
      title: t.legal.privacy.metaTitle,
      description: t.legal.privacy.metaDescription,
    },
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return <LegalPage t={t} doc="privacy" />;
}
