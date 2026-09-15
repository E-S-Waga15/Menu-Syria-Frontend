"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyRestaurant } from "@/features/restaurant-dashboard/services";
import { queryKeys } from "@/lib/api/query-keys";
import type { Restaurant } from "@/lib/types";

/** The signed-in owner's business, shared by every dashboard screen. */
export function useMyBusiness() {
  return useQuery({
    queryKey: queryKeys.me.business,
    queryFn: getMyRestaurant,
  });
}

/**
 * The id every write is addressed with.
 *
 * `fallback` exists because a screen that has already loaded a list knows the
 * business id from the rows themselves (`restaurantId`/`businessId`), which is
 * enough to make its first edit work without waiting for this second request.
 */
export function useBusinessId(fallback?: string): string {
  const { data } = useMyBusiness();
  return data?.id ?? fallback ?? "";
}

export type { Restaurant };
