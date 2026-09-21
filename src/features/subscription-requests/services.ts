import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";

/**
 * Subscription requests are the hand-to-hand billing workflow: a business (or
 * an agent on a business's behalf) asks to register/renew, and an admin
 * approves only once the cash has actually been collected.
 */

export interface SubscriptionRequest {
  id: string;
  businessId: string;
  planId: string;
  agentId: string | null;
  requestedByUserId: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  business?: { id: string; name: string; slug: string } | null;
  plan?: { id: string; name: string; price: string | number } | null;
  agent?: { id: string; name: string } | null;
}

export interface Plan {
  id: string;
  name: string | { ar: string; en: string };
  price: string | number;
  agentPrice: string | number;
  durationDays: number;
}

export interface PendingSubscription {
  id: string;
  businessId: string;
  planId: string;
  status: string;
  createdAt: string;
  business?: { id: string; name: string; slug: string } | null;
  plan?: { id: string; name: string; price: string | number; durationDays: number } | null;
  agent?: { id: string; name: string } | null;
}

export async function getSubscriptionPlans(): Promise<Plan[]> {
  if (IS_MOCK) return mockDelay([]);
  try {
    return await apiFetch<Plan[]>("/subscription-plans");
  } catch {
    // Public endpoint may be unreachable in some environments — the plan
    // picker hides itself instead of breaking the whole screen.
    return [];
  }
}

/** Business renews itself / agent renews a referred business. */
export async function createSubscriptionRequest(
  input: { businessId?: string; planId: string; notes?: string },
): Promise<SubscriptionRequest> {
  if (IS_MOCK) {
    return mockDelay({
      id: `sr-${Date.now()}`,
      businessId: input.businessId ?? "",
      planId: input.planId,
      agentId: null,
      requestedByUserId: null,
      notes: input.notes ?? null,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }
  return apiFetch<SubscriptionRequest>("/subscription-requests", {
    method: "POST",
    body: input,
  });
}

export async function getSubscriptionRequests(
  auth: { accessToken?: string | null } = {},
): Promise<SubscriptionRequest[]> {
  if (IS_MOCK) return mockDelay([]);
  return apiFetch<SubscriptionRequest[]>("/subscription-requests", {
    headers: auth.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : {},
  });
}

export async function updateSubscriptionRequestStatus(
  id: string,
  status: "approved" | "rejected",
  auth: { accessToken?: string | null } = {},
): Promise<SubscriptionRequest> {
  return apiFetch<SubscriptionRequest>(`/subscription-requests/${id}/status`, {
    method: "PATCH",
    headers: auth.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : {},
    body: { status },
  });
}

export async function getPendingSubscriptions(
  auth: { accessToken?: string | null } = {},
): Promise<PendingSubscription[]> {
  if (IS_MOCK) return mockDelay([]);
  return apiFetch<PendingSubscription[]>("/subscriptions/pending", {
    headers: auth.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : {},
  });
}

/** Admin confirms the cash was collected and activates the subscription. */
export async function activateSubscription(
  id: string,
  body: { amountPaid?: number; startDate?: string } = {},
  auth: { accessToken?: string | null } = {},
): Promise<PendingSubscription> {
  return apiFetch<PendingSubscription>(`/subscriptions/${id}/activate`, {
    method: "POST",
    headers: auth.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : {},
    body,
  });
}
