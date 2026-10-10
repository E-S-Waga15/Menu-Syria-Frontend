import { apiFetch, apiGetOrUndefined, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  agents,
  businessSubTypes,
  governorates,
  regions,
  restaurants,
  reviews,
} from "@/lib/mock/data";
import type {
  Agent,
  BusinessSubType,
  Governorate,
  Region,
  Restaurant,
  Review,
} from "@/lib/types";

export interface SubscriptionPlanOption {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlanOption[]> {
  if (IS_MOCK) {
    const { plans } = await import("@/lib/mock/data");
    return mockDelay(
      plans.map((plan) => ({
        id: plan.id,
        name: plan.name.en,
        price: plan.priceMonthly,
        durationDays: 30,
      })),
    );
  }
  return apiFetch("/subscription-plans");
}

export async function getGovernorates(): Promise<Governorate[]> {
  if (IS_MOCK) return mockDelay(governorates, 150);
  const items = await apiFetch<Array<{ id: string; governorateName: string }>>(
    "/locations/governorates",
  );
  return items.map((item) => ({
    id: item.id,
    name: { ar: item.governorateName, en: item.governorateName },
  }));
}

export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  if (IS_MOCK) return mockDelay(restaurants);
  return apiFetch("/restaurants/featured");
}

export async function getRestaurantBySlug(
  slug: string,
): Promise<Restaurant | undefined> {
  if (IS_MOCK)
    return mockDelay(restaurants.find((r) => r.slug === slug));
  return apiGetOrUndefined(`/restaurants/${slug}`);
}

export async function getRegions(): Promise<Region[]> {
  if (IS_MOCK) return mockDelay(regions, 100);
  const items = await apiFetch<
    Array<{ id: string; governorateId: string; districtName: string }>
  >("/locations/districts");
  return items.map((item) => ({
    id: item.id,
    governorateId: item.governorateId,
    name: { ar: item.districtName, en: item.districtName },
  }));
}

/**
 * The business categories (cuisines, store sectors) offered at registration.
 * The backend has no RESTAURANT/STORE flag on these — only a coarse
 * `category` (`food_beverage` | `retail_goods`) — and ignores any query
 * param, so the type→category mapping and the filtering both happen here.
 */
export async function getBusinessSubTypes(
  type: "RESTAURANT" | "STORE",
): Promise<BusinessSubType[]> {
  const category = type === "RESTAURANT" ? "food_beverage" : "retail_goods";
  const all = IS_MOCK
    ? await mockDelay(businessSubTypes, 120)
    : await apiFetch<BusinessSubType[]>("/business-sub-types");
  return all.filter((s) => s.category === category);
}

export async function getAgents(): Promise<Agent[]> {
  if (IS_MOCK) return mockDelay(agents, 200);
  return apiFetch("/agents");
}

export async function getAgentById(id: string): Promise<Agent | undefined> {
  if (IS_MOCK) return mockDelay(agents.find((a) => a.id === id), 150);
  return apiGetOrUndefined(`/agents/${id}`);
}

/** Restaurants subscribed through this agent */
export async function getAgentRestaurants(
  agentId: string,
): Promise<Restaurant[]> {
  if (IS_MOCK) {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return mockDelay([]);
    // agent's governorate first, then the rest — keeps the section full
    const local = restaurants.filter(
      (r) => r.governorateId === agent.governorateId,
    );
    const others = restaurants.filter(
      (r) => r.governorateId !== agent.governorateId,
    );
    return mockDelay([...local, ...others], 200);
  }
  return apiFetch(`/agents/${agentId}/restaurants`);
}

export async function getAgentsByGovernorate(
  governorateId: string,
): Promise<Agent[]> {
  if (IS_MOCK)
    return mockDelay(
      agents.filter((a) => a.governorateId === governorateId),
    );
  return apiFetch(`/agents?governorate=${governorateId}`);
}

export async function getRestaurantReviews(
  restaurantId: string,
): Promise<Review[]> {
  if (IS_MOCK)
    return mockDelay(reviews.filter((r) => r.restaurantId === restaurantId));
  return apiFetch(`/restaurants/${restaurantId}/reviews`);
}
