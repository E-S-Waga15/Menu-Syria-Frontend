import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuScreen } from "@/features/public-menu/components/menu-screen";
import { getPublicMenu } from "@/features/public-menu/services";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/menu/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu || !isLocale(lang)) return {};
  return {
    title: menu.restaurant.name[lang],
    description: menu.restaurant.description[lang],
  };
}

export default async function PublicMenuPage({
  params,
}: PageProps<"/[lang]/menu/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const menu = await getPublicMenu(slug);
  if (!menu) notFound();

  return <MenuScreen menu={menu} />;
}
