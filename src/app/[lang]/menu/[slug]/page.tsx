import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuScreen } from "@/features/public-menu/components/menu-screen";
import { getPublicMenu } from "@/features/public-menu/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { JsonLd, restaurantJsonLd } from "@/lib/seo/json-ld";
import { alternatesFor, SITE_URL } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/menu/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu || !isLocale(lang)) return {};
  return {
    title: menu.restaurant.name[lang],
    description: menu.restaurant.description[lang],
    alternates: alternatesFor(lang, `/menu/${slug}`),
    openGraph: {
      title: menu.restaurant.name[lang],
      description: menu.restaurant.description[lang],
      images: menu.restaurant.coverImages[0]
        ? [menu.restaurant.coverImages[0]]
        : undefined,
    },
  };
}

export default async function PublicMenuPage({
  params,
  searchParams,
}: PageProps<"/[lang]/menu/[slug]">) {
  const { lang, slug } = await params;
  const { t: tableParam } = await searchParams;
  if (!isLocale(lang)) notFound();

  const [menu, t] = await Promise.all([
    getPublicMenu(slug),
    getDictionary(lang),
  ]);
  if (!menu) notFound();

  return (
    <>
      <JsonLd
        data={restaurantJsonLd(
          menu.restaurant,
          lang,
          `${SITE_URL}/${lang}/menu/${slug}`,
        )}
      />
      <MenuScreen
        business={menu.restaurant}
        subtitle={menu.restaurant.cuisine}
        categories={menu.categories}
        items={menu.items}
        governorateName={menu.governorateName}
        regionName={menu.regionName}
        aboutHref={`/${lang}/menu/${slug}/about`}
        copy={t.menu}
        tableParam={typeof tableParam === "string" ? tableParam : undefined}
      />
    </>
  );
}
