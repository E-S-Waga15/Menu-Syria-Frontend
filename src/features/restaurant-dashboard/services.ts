import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import {
  diningTables,
  menuCategories,
  menuItems,
  orders,
  restaurantAnalytics,
  restaurants,
  waiters,
} from "@/lib/mock/data";
import type {
  DiningTable,
  MenuCategory,
  MenuItem,
  Order,
  Restaurant,
  RestaurantAnalytics,
  Waiter,
} from "@/lib/types";

/** The signed-in demo restaurant. */
export async function getMyRestaurant(): Promise<Restaurant> {
  if (IS_MOCK) return mockDelay(restaurants[0]!);
  return apiFetch("/me/restaurant");
}

export async function getMyMenu(): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
}> {
  if (IS_MOCK)
    return mockDelay({ categories: menuCategories, items: menuItems });
  return apiFetch("/me/menu");
}

export async function getMyOrders(): Promise<Order[]> {
  if (IS_MOCK) return mockDelay(orders);
  return apiFetch("/me/orders");
}

export async function getMyTables(): Promise<DiningTable[]> {
  if (IS_MOCK) return mockDelay(diningTables);
  return apiFetch("/me/tables");
}

export async function getMyWaiters(): Promise<Waiter[]> {
  if (IS_MOCK) return mockDelay(waiters, 150);
  return apiFetch("/me/waiters");
}

export async function getMyAnalytics(): Promise<RestaurantAnalytics> {
  if (IS_MOCK) return mockDelay(restaurantAnalytics);
  return apiFetch("/me/analytics");
}
