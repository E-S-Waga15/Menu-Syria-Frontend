import { apiFetch, apiGetOrUndefined, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  agents,
  governorates,
  regions,
  restaurants,
  reviews,
} from "@/lib/mock/data";
import type {
  Agent,
  Governorate,
  Region,
  Restaurant,
  Review,
} from "@/lib/types";

export async function getGovernorates(): Promise<Governorate[]> {
  if (IS_MOCK) return mockDelay(governorates, 150);
  return apiFetch("/governorates");
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
  return apiFetch("/regions");
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
