import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RestaurantDetailsBody } from "@/features/marketing/components/restaurant-details-body";
import { RestaurantGallery } from "@/features/marketing/components/restaurant-gallery";
import {
  getGovernorates,
  getRegions,
  getRestaurantBySlug,
  getRestaurantReviews,
} from "@/features/marketing/services";
import { BackToMenuBar } from "@/features/public-menu/components/back-to-menu-bar";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/menu/[slug]/about">): Promise<Metadata> {
  const { lang, slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !isLocale(lang)) return {};
  return {
    title: restaurant.name[lang],
    description: restaurant.description[lang],
  };
}

/**
 * Restaurant details reachable from the public menu. Unlike the marketing
 * details page, this one renders with no site header, nav, or footer —
 * QR visitors get the restaurant's story without a door into the platform.
 */
export default async function MenuAboutPage({
  params,
}: PageProps<"/[lang]/menu/[slug]/about">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [t, restaurant] = await Promise.all([
    getDictionary(lang),
    getRestaurantBySlug(slug),
  ]);
  if (!restaurant) notFound();

  const [reviews, governorates, regions] = await Promise.all([
    getRestaurantReviews(restaurant.id),
    getGovernorates(),
    getRegions(),
  ]);

  const governorateName =
    governorates.find((g) => g.id === restaurant.governorateId)?.name[lang] ??
    "";
  const regionName =
    regions.find((r) => r.id === restaurant.regionId)?.name[lang] ?? "";

  return (
    <main className="pt-14">
      <BackToMenuBar menuHref={`/${lang}/menu/${slug}`} />
      <RestaurantGallery images={restaurant.coverImages} />
      <RestaurantDetailsBody
        restaurant={restaurant}
        reviews={reviews}
        governorateName={governorateName}
        regionName={regionName}
        lang={lang}
        t={t}
        showMenuCta={false}
      />
    </main>
  );
}
