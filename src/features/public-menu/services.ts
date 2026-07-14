import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
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
  return apiFetch(`/menu/${slug}`);
}
