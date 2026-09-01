import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import { agents, agentTransactions, restaurants, stores } from "@/lib/mock/data";
import type { Agent, Restaurant, Store, Transaction } from "@/lib/types";

export async function getMyAgentProfile(): Promise<Agent> {
  if (IS_MOCK) return mockDelay(agents[0]!);
  return apiFetch("/me/agent");
}

export async function getMyTransactions(): Promise<Transaction[]> {
  if (IS_MOCK) return mockDelay(agentTransactions);
  return apiFetch("/me/agent/transactions");
}

export async function getMyReferredRestaurants(): Promise<Restaurant[]> {
  if (IS_MOCK) return mockDelay(restaurants);
  return apiFetch("/me/agent/restaurants");
}

export async function getMyReferredStores(): Promise<Store[]> {
  if (IS_MOCK) return mockDelay(stores);
  return apiFetch("/me/agent/stores");
}

/**
 * One business by id across both kinds — the subscription page is addressed by
 * id alone, so it has to resolve without knowing which list it came from.
 */
export async function getReferredBusiness(id: string) {
  const [referredRestaurants, referredStores] = await Promise.all([
    getMyReferredRestaurants(),
    getMyReferredStores(),
  ]);

  const restaurant = referredRestaurants.find((r) => r.id === id);
  if (restaurant) return { business: restaurant, kind: "restaurant" as const };

  const store = referredStores.find((s) => s.id === id);
  if (store) return { business: store, kind: "store" as const };

  return null;
}
