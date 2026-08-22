import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminLogin } from "@/features/admin/components/admin-login";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.auth.adminTitle,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLoginPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AdminLogin />;
}
