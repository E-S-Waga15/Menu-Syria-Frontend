"use client";

import type { ReactNode } from "react";

import { useHydratedSession } from "@/features/auth/use-hydrated-session";
import { UserHome } from "@/features/marketing/components/user-home";

/**
 * Picks which home page the visitor gets.
 *
 * A signed-in customer has already been sold on the platform, so the marketing
 * pitch is replaced with their own home. Everyone else keeps it — including
 * owners, agents and admins, whose real work lives in their dashboards rather
 * than here.
 *
 * The marketing tree is rendered on the server and handed in as a prop, so it
 * is still what a crawler sees and the page keeps its SEO content in the
 * initial HTML. The swap happens only after the persisted session has
 * hydrated, which is also why `hydrated` is checked: without it the first
 * paint would flash the marketing page at a signed-in customer on every load.
 */
export function HomeSwitch({ marketing }: { marketing: ReactNode }) {
  const { session, hydrated } = useHydratedSession();

  if (!hydrated || session?.role !== "user") return marketing;
  return <UserHome />;
}
