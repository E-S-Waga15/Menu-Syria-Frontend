import { apiFetch, apiGetOrUndefined, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  governorates,
  menuCategories,
  menuItems,
  regions,
  restaurants,
} from "@/lib/mock/data";
import type {
  LocalizedText,
  MenuCategory,
  MenuItem,
  Restaurant,
} from "@/lib/types";

export interface PublicMenu {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  governorateName: LocalizedText;
  regionName: LocalizedText;
}

export async function getPublicMenu(
  slug: string,
): Promise<PublicMenu | undefined> {
  if (IS_MOCK) {
    const restaurant = restaurants.find((r) => r.slug === slug);
    if (!restaurant) return mockDelay(undefined);
    // Demo data ships one full menu; every restaurant serves it for now
    const categories = menuCategories
      .map((c) => ({ ...c, restaurantId: restaurant.id }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const items = menuItems.map((i) => ({
      ...i,
      restaurantId: restaurant.id,
    }));
    const governorateName = governorates.find(
      (g) => g.id === restaurant.governorateId,
    )?.name ?? { ar: "", en: "" };
    const regionName = regions.find((r) => r.id === restaurant.regionId)
      ?.name ?? { ar: "", en: "" };
    return mockDelay({
      restaurant,
      categories,
      items,
      governorateName,
      regionName,
    });
  }
  return apiGetOrUndefined(`/menu/${slug}`);
}

// ---------------------------------------------------------------------------
// Guest ordering
// ---------------------------------------------------------------------------

/**
 * What the backend returns after a customer places an order through the
 * platform (`POST /public/businesses/:slug/orders`). The `whatsappLink` is
 * how the order physically reaches the business — the public endpoint both
 * records the order and builds the message that hands it over.
 */
export interface ExternalOrderResponse {
  id: string;
  businessId: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  createdAt: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  whatsappLink: string | null;
}

export interface ExternalOrderInput {
  customerName: string;
  customerPhone: string;
  notes?: string;
  /** real menu/catalog item UUIDs — offer bundles use synthetic `offer-` ids
   * and cannot be submitted through this endpoint yet */
  items: { itemId: string; quantity: number }[];
}

/** Place a guest order through the platform. */
export async function placeExternalOrder(
  slug: string,
  input: ExternalOrderInput,
): Promise<ExternalOrderResponse> {
  if (IS_MOCK) {
    return mockDelay<ExternalOrderResponse>({
      id: "mock-order-id",
      businessId: "",
      status: "pending",
      totalAmount: 0,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
      items: [],
      whatsappLink: null,
    });
  }
  return apiFetch(`/public/businesses/${slug}/orders`, {
    method: "POST",
    body: input,
  });
}
