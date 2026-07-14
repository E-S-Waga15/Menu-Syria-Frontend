import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import { agents, agentTransactions, restaurants } from "@/lib/mock/data";
import type { Agent, Restaurant, Transaction } from "@/lib/types";

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
