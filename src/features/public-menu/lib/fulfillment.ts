import type { Business, FulfillmentMode } from "@/lib/types";

/** Restaurants support all three modes; stores never offer dine-in — same
 * `"cuisine" in business` narrowing already used elsewhere (e.g.
 * `favorites-list.tsx`) to tell a `Restaurant` from a `Store`. */
export function getSupportedFulfillment(business: Business): FulfillmentMode[] {
  return "cuisine" in business
    ? ["dineIn", "pickup", "delivery"]
    : ["pickup", "delivery"];
}
