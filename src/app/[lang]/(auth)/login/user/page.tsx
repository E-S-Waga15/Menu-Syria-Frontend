import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserLoginFlow } from "@/features/auth/components/user-login-flow";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: t.auth.userLoginTitle, description: t.auth.userLoginBody };
}

export default async function UserLoginPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <UserLoginFlow />;
}
