import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RestaurantCard } from "@/features/marketing/components/restaurant-card";
import {
  getFeaturedRestaurants,
  getGovernorates,
  getRegions,
} from "@/features/marketing/services";
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
    title: t.seo.restaurantsTitle,
    description: t.seo.restaurantsDescription,
    alternates: alternatesFor(lang, "/restaurants"),
  };
}

export default async function RestaurantsPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // fetched on the server — the full grid ships as crawlable HTML
  const [t, restaurants, governorates, regions] = await Promise.all([
    getDictionary(lang),
    getFeaturedRestaurants(),
    getGovernorates(),
    getRegions(),
  ]);

  const separator = lang === "ar" ? "، " : ", ";
  const locationLabel = (governorateId: string, regionId: string) => {
    const gov = governorates.find((g) => g.id === governorateId)?.name[lang];
    const region = regions.find((r) => r.id === regionId)?.name[lang];
    return [gov, region].filter(Boolean).join(separator);
  };

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <div className="max-w-2xl">
        <p className="label-eyebrow text-primary">
          {t.home.restaurantsEyebrow}
        </p>
        <h1 className="text-display mt-3 text-3xl md:text-4xl">
          {t.restaurantsPage.title}
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {t.restaurantsPage.subtitle}
        </p>
      </div>

      <div className="mt-10">
        {restaurants.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            {t.restaurantsPage.empty}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                locationLabel={locationLabel(
                  restaurant.governorateId,
                  restaurant.regionId,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
