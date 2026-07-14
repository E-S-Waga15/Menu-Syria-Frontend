import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  agents,
  agentTransactions,
  restaurants,
} from "@/lib/mock/data";
import type { Agent, Restaurant, Transaction } from "@/lib/types";

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
