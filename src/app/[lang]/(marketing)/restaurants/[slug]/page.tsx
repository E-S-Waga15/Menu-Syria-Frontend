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
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  breadcrumbsJsonLd,
  JsonLd,
  restaurantJsonLd,
} from "@/lib/seo/json-ld";
import { alternatesFor, SITE_URL } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/restaurants/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return {};
  return {
    title: restaurant.name[lang],
    description: restaurant.description[lang],
    alternates: alternatesFor(lang, `/restaurants/${slug}`),
    openGraph: {
      title: restaurant.name[lang],
      description: restaurant.description[lang],
      images: restaurant.coverImages[0] ? [restaurant.coverImages[0]] : undefined,
    },
  };
}

export default async function RestaurantDetailsPage({
  params,
}: PageProps<"/[lang]/restaurants/[slug]">) {
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

  const pageUrl = `${SITE_URL}/${lang}/restaurants/${slug}`;

  return (
    <main className="pt-16">
      <JsonLd data={restaurantJsonLd(restaurant, lang, pageUrl)} />
      <JsonLd
        data={breadcrumbsJsonLd([
          { name: t.nav.home, url: `${SITE_URL}/${lang}` },
          { name: t.nav.restaurants, url: `${SITE_URL}/${lang}/restaurants` },
          { name: restaurant.name[lang], url: pageUrl },
        ])}
      />
      <RestaurantGallery images={restaurant.coverImages} />
      <RestaurantDetailsBody
        restaurant={restaurant}
        reviews={reviews}
        governorateName={governorateName}
        regionName={regionName}
        lang={lang}
        t={t}
      />
    </main>
  );
}
