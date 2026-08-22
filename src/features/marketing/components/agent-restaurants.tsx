import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/features/marketing/components/restaurant-card";
import type { Locale } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Governorate, Region, Restaurant } from "@/lib/types";

/**
 * Server component — the agent's partner restaurants ship as crawlable HTML.
 * Only the favorite button inside each card hydrates on the client.
 */
export function AgentRestaurants({
  restaurants,
  governorates,
  regions,
  restaurantsCount,
  lang,
  t,
}: {
  restaurants: Restaurant[];
  governorates: Governorate[];
  regions: Region[];
  restaurantsCount: number;
  lang: Locale;
  t: Dictionary;
}) {
  const separator = lang === "ar" ? "، " : ", ";
  const locationLabel = (governorateId: string, regionId: string) => {
    const gov = governorates.find((g) => g.id === governorateId)?.name[lang];
    const region = regions.find((r) => r.id === regionId)?.name[lang];
    return [gov, region].filter(Boolean).join(separator);
  };

  const ViewAllArrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="mt-14 border-t border-border/60 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">
            {t.agentPage.partnerRestaurants}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-muted-foreground">
            {fmt(t.agentPage.restaurantsCount, { count: restaurantsCount })}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          render={<Link href={`/${lang}/restaurants`} />}
        >
          {t.agentPage.viewAllRestaurants}
          <ViewAllArrow className="size-4" />
        </Button>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.slice(0, 4).map((restaurant) => (
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
    </section>
  );
}
