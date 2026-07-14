"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCard } from "@/features/marketing/components/restaurant-card";
import {
  getFeaturedRestaurants,
  getGovernorates,
  getRegions,
} from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function RestaurantsGrid() {
  const { t, lang } = useI18n();

  const { data: restaurants } = useQuery({
    queryKey: queryKeys.restaurants.all,
    queryFn: getFeaturedRestaurants,
  });
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  if (!restaurants) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
        {t.restaurantsPage.empty}
      </p>
    );
  }

  const separator = lang === "ar" ? "، " : ", ";
  const locationLabel = (governorateId: string, regionId: string) => {
    const gov = governorates?.find((g) => g.id === governorateId)?.name[lang];
    const region = regions?.find((r) => r.id === regionId)?.name[lang];
    return [gov, region].filter(Boolean).join(separator);
  };

  return (
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
  );
}
