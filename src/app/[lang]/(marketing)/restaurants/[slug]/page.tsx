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

  return (
    <main className="pt-16">
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
