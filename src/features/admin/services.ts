import { apiFetch, apiGetOrUndefined, IS_MOCK, mockDelay } from "@/lib/api/client";
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

/**
 * Extra auth the console's server components thread in: server-side
 * fetches read the session cookie (see `features/admin/server.ts`),
 * while client components skip this and let `apiFetch` attach the
 * localStorage token itself.
 */
export type AdminAuth = { accessToken?: string | null };

/** Authorization header for an explicitly-provided token, if any. */
function authHeaders({ accessToken }: AdminAuth): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export interface AdminStats {
  totalRestaurants: number;
  totalAgents: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export async function getAdminStats(
  auth: AdminAuth = {},
): Promise<AdminStats> {
  if (IS_MOCK)
    return mockDelay({
      totalRestaurants: 642,
      totalAgents: 41,
      monthlyRevenue: 128500000,
      activeSubscriptions: 587,
    });
  return apiFetch("/admin/stats", { headers: authHeaders(auth) });
}

export async function getAdminRestaurants(
  auth: AdminAuth = {},
): Promise<Restaurant[]> {
  if (IS_MOCK) return mockDelay(restaurants);
  return apiFetch("/admin/restaurants", { headers: authHeaders(auth) });
}

export async function getAdminAgents(auth: AdminAuth = {}): Promise<Agent[]> {
  if (IS_MOCK) return mockDelay(agents);
  return apiFetch("/admin/agents", { headers: authHeaders(auth) });
}

export async function getAdminAgentById(
  id: string,
  auth: AdminAuth = {},
): Promise<Agent | undefined> {
  if (IS_MOCK) return mockDelay(agents.find((a) => a.id === id));
  return apiGetOrUndefined(`/admin/agents/${id}`, { headers: authHeaders(auth) });
}

export async function getAdminAgentLedger(
  id: string,
  auth: AdminAuth = {},
): Promise<Transaction[]> {
  if (IS_MOCK) return mockDelay(agentTransactions);
  return apiFetch(`/admin/agents/${id}/ledger`, { headers: authHeaders(auth) });
}

export async function getAdminStores(auth: AdminAuth = {}): Promise<Store[]> {
  if (IS_MOCK) return mockDelay(stores);
  return apiFetch("/admin/stores", { headers: authHeaders(auth) });
}

export async function getAdminUsers(
  auth: AdminAuth = {},
): Promise<PlatformUser[]> {
  if (IS_MOCK) return mockDelay(platformUsers);
  return apiFetch("/admin/users", { headers: authHeaders(auth) });
}

export async function getAdminPlans(auth: AdminAuth = {}): Promise<Plan[]> {
  if (IS_MOCK) return mockDelay(plans);
  return apiFetch("/admin/plans", { headers: authHeaders(auth) });
}

/**
 * Every paying business in one list, tagged by kind.
 *
 * Subscriptions are not a separate record in the mock: a subscription *is* a
 * business's plan dates, so the console reads them off the businesses rather
 * than keeping a second list that could disagree.
 */
export async function getAdminSubscriptions(
  auth: AdminAuth = {},
): Promise<{ business: Business; kind: "restaurant" | "store" }[]> {
  const [restaurantList, storeList] = await Promise.all([
    getAdminRestaurants(auth),
    getAdminStores(auth),
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
export async function getAdminBusiness(
  id: string,
  auth: AdminAuth = {},
) {
  const [restaurantList, storeList] = await Promise.all([
    getAdminRestaurants(auth),
    getAdminStores(auth),
  ]);

  const restaurant = restaurantList.find((r) => r.id === id);
  if (restaurant) return { business: restaurant, kind: "restaurant" as const };

  const store = storeList.find((s) => s.id === id);
  if (store) return { business: store, kind: "store" as const };

  return null;
}
