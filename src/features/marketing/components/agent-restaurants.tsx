"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCard } from "@/features/marketing/components/restaurant-card";
import {
  getAgentRestaurants,
  getGovernorates,
  getRegions,
} from "@/features/marketing/services";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function AgentRestaurants({
  agentId,
  restaurantsCount,
}: {
  agentId: string;
  restaurantsCount: number;
}) {
  const { t, lang, dir } = useI18n();

  const { data: restaurants, isPending } = useQuery({
    queryKey: queryKeys.agents.restaurants(agentId),
    queryFn: () => getAgentRestaurants(agentId),
  });
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  const separator = lang === "ar" ? "، " : ", ";
  const locationLabel = (governorateId: string, regionId: string) => {
    const gov = governorates?.find((g) => g.id === governorateId)?.name[lang];
    const region = regions?.find((r) => r.id === regionId)?.name[lang];
    return [gov, region].filter(Boolean).join(separator);
  };

  const ViewAllArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

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
        {isPending &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}

        {restaurants?.slice(0, 4).map((restaurant) => (
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
