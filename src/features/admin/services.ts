import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  agentTransactions,
  agents,
  plans,
  platformUsers,
  restaurants,
  stores,
} from "@/lib/mock/data";
import type {
  Agent,
  Business,
  Plan,
  PlatformUser,
  Restaurant,
  Store,
  Transaction,
} from "@/lib/types";

export interface AdminStats {
  totalRestaurants: number;
  totalAgents: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (IS_MOCK)
    return mockDelay({
      totalRestaurants: 642,
      totalAgents: 41,
      monthlyRevenue: 128500000,
      activeSubscriptions: 587,
    });
  return apiFetch("/admin/stats");
}

export async function getAdminRestaurants(): Promise<Restaurant[]> {
  if (IS_MOCK) return mockDelay(restaurants);
  return apiFetch("/admin/restaurants");
}

export async function getAdminAgents(): Promise<Agent[]> {
  if (IS_MOCK) return mockDelay(agents);
  return apiFetch("/admin/agents");
}

export async function getAdminAgentById(
  id: string,
): Promise<Agent | undefined> {
  if (IS_MOCK) return mockDelay(agents.find((a) => a.id === id));
  return apiFetch(`/admin/agents/${id}`);
}

export async function getAdminAgentLedger(id: string): Promise<Transaction[]> {
  if (IS_MOCK) return mockDelay(agentTransactions);
  return apiFetch(`/admin/agents/${id}/ledger`);
}

export async function getAdminStores(): Promise<Store[]> {
  if (IS_MOCK) return mockDelay(stores);
  return apiFetch("/admin/stores");
}

export async function getAdminUsers(): Promise<PlatformUser[]> {
  if (IS_MOCK) return mockDelay(platformUsers);
  return apiFetch("/admin/users");
}

export async function getAdminPlans(): Promise<Plan[]> {
  if (IS_MOCK) return mockDelay(plans);
  return apiFetch("/admin/plans");
}

/**
 * Every paying business in one list, tagged by kind.
 *
 * Subscriptions are not a separate record in the mock: a subscription *is* a
 * business's plan dates, so the console reads them off the businesses rather
 * than keeping a second list that could disagree.
 */
export async function getAdminSubscriptions(): Promise<
  { business: Business; kind: "restaurant" | "store" }[]
> {
  const [restaurantList, storeList] = await Promise.all([
    getAdminRestaurants(),
    getAdminStores(),
  ]);

  return [
    ...restaurantList.map((business) => ({
      business,
      kind: "restaurant" as const,
    })),
    ...storeList.map((business) => ({ business, kind: "store" as const })),
  ];
}

/** one business by id, whichever kind it is — the console addresses by id */
export async function getAdminBusiness(id: string) {
  const [restaurantList, storeList] = await Promise.all([
    getAdminRestaurants(),
    getAdminStores(),
  ]);

  const restaurant = restaurantList.find((r) => r.id === id);
  if (restaurant) return { business: restaurant, kind: "restaurant" as const };

  const store = storeList.find((s) => s.id === id);
  if (store) return { business: store, kind: "store" as const };

  return null;
}
