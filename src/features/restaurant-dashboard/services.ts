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
  CatalogOptionGroup,
  DiningTable,
  LocalizedText,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  RestaurantAnalytics,
  Waiter,
} from "@/lib/types";

type Raw = Record<string, unknown>;

/** The write endpoints answer with single-locale rows, while `/me/menu` already
 * answers with the bilingual domain shape. Every mapper below accepts both and
 * settles on the domain shape, so a create/update response can be dropped
 * straight into the cache the list reads. */
const toLocalized = (value: unknown): LocalizedText => {
  if (value && typeof value === "object" && "ar" in value && "en" in value) {
    return value as LocalizedText;
  }
  const text = typeof value === "string" ? value : "";
  return { ar: text, en: text };
};

/** Decimal columns arrive as strings ("40000.00") — coerce to numbers. */
const toNumber = (value: unknown): number => Number(value ?? 0);

function normalizeCategory(raw: Raw, businessId: string): MenuCategory {
  return {
    id: String(raw.id),
    restaurantId: String(raw.businessId ?? raw.restaurantId ?? businessId),
    name: toLocalized(raw.name),
    sortOrder: toNumber(raw.sortOrder),
  };
}

function normalizeItem(raw: Raw, businessId: string): MenuItem {
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map((image) =>
        typeof image === "string"
          ? image
          : String((image as Raw)?.imageUrl ?? ""),
      )
    : [];
  const gallery = images.filter(Boolean);
  const attributes = (raw.attributes ?? {}) as Raw;
  const optionGroups =
    (attributes.optionGroups as CatalogOptionGroup[] | undefined) ??
    (raw.optionGroups as CatalogOptionGroup[] | undefined);

  return {
    id: String(raw.id),
    categoryId: String(raw.categoryId),
    restaurantId: String(raw.businessId ?? raw.restaurantId ?? businessId),
    name: toLocalized(raw.name),
    description: toLocalized(raw.description),
    price: toNumber(raw.price),
    imageUrl: gallery[0] ?? String(raw.imageUrl ?? ""),
    images: gallery.length ? gallery : undefined,
    optionGroups: optionGroups?.length ? optionGroups : undefined,
    isAvailable: raw.isAvailable !== false,
    sortOrder: toNumber(raw.sortOrder),
  };
}

function normalizeOrder(raw: Raw): Order {
  return raw as unknown as Order;
}

function normalizeTable(raw: Raw): DiningTable {
  const status = raw.status === undefined ? "" : String(raw.status);
  return {
    id: String(raw.id),
    number: toNumber(raw.number ?? raw.tableNumber),
    shape: raw.shape === "round" ? "round" : "square",
    seats: toNumber(raw.seats) || 4,
    // the API's own status enum is the authority; `isOccupied` is only accepted
    // as a fallback for a payload that carries no status
    isOccupied:
      raw.status !== undefined ? status === "occupied" : Boolean(raw.isOccupied),
    waiterId: raw.waiterId ? String(raw.waiterId) : undefined,
    x: toNumber(raw.x),
    y: toNumber(raw.y),
  };
}

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
  const raw = await apiFetch<{ categories: Raw[]; items: Raw[] }>("/me/menu");
  // the payload carries no business id of its own, but every row does
  const businessId = String(raw.categories[0]?.businessId ?? "");
  return {
    categories: raw.categories.map((c) => normalizeCategory(c, businessId)),
    items: raw.items.map((i) => normalizeItem(i, businessId)),
  };
}

export async function getMyOrders(): Promise<Order[]> {
  if (IS_MOCK) return mockDelay(orders);
  const raw = await apiFetch<Raw[]>("/me/orders");
  return raw.map(normalizeOrder);
}

export async function getMyTables(): Promise<DiningTable[]> {
  if (IS_MOCK) return mockDelay(diningTables);
  const raw = await apiFetch<Raw[]>("/me/tables");
  return raw.map(normalizeTable);
}

export async function getMyWaiters(): Promise<Waiter[]> {
  if (IS_MOCK) return mockDelay(waiters, 150);
  return apiFetch("/me/waiters");
}

export async function getMyAnalytics(): Promise<RestaurantAnalytics> {
  if (IS_MOCK) return mockDelay(restaurantAnalytics);
  return apiFetch("/me/analytics");
}

// ---------------------------------------------------------------------------
// Writes — categories
// ---------------------------------------------------------------------------

export async function createCategory(input: {
  businessId: string;
  name: string;
  sortOrder: number;
}): Promise<MenuCategory> {
  if (IS_MOCK)
    return mockDelay({
      id: `c${Date.now()}`,
      restaurantId: input.businessId,
      name: { ar: input.name, en: input.name },
      sortOrder: input.sortOrder,
    });
  const raw = await apiFetch<Raw>("/categories", {
    method: "POST",
    body: input,
  });
  return normalizeCategory(raw, input.businessId);
}

export async function updateCategory(input: {
  id: string;
  businessId: string;
  name?: string;
  sortOrder?: number;
}): Promise<MenuCategory> {
  const { id, businessId, ...body } = input;
  if (IS_MOCK)
    return mockDelay({
      id,
      restaurantId: businessId,
      name: toLocalized(body.name),
      sortOrder: body.sortOrder ?? 0,
    });
  const raw = await apiFetch<Raw>(`/categories/${id}`, {
    method: "PATCH",
    body,
  });
  return normalizeCategory(raw, businessId);
}

export async function deleteCategory(id: string): Promise<void> {
  if (IS_MOCK) return mockDelay(undefined);
  await apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Writes — items (a dish on a menu, a product in a store)
// ---------------------------------------------------------------------------

export interface ItemWriteInput {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  optionGroups?: CatalogOptionGroup[];
  isAvailable?: boolean;
  sortOrder?: number;
}

/**
 * The item payload the API expects.
 *
 * `optionGroups` rides inside `attributes` — the entity's documented home for
 * category-specific fields — rather than as columns of its own, which is what
 * lets a restaurant's sizes and a store's variants share one storage slot.
 */
function toItemBody(input: Partial<ItemWriteInput> & Record<string, unknown>) {
  const body: Record<string, unknown> = {};
  for (const key of [
    "categoryId",
    "name",
    "description",
    "price",
    "images",
    "isAvailable",
    "sortOrder",
  ] as const) {
    if (input[key] !== undefined) body[key] = input[key];
  }
  if (input.optionGroups !== undefined) {
    body.attributes = { optionGroups: input.optionGroups };
  }
  return body;
}

function mockItem(input: Partial<ItemWriteInput> & { id?: string }): MenuItem {
  return {
    id: input.id ?? `m${Date.now()}`,
    categoryId: input.categoryId ?? "",
    restaurantId: "",
    name: toLocalized(input.name),
    description: toLocalized(input.description),
    price: input.price ?? 0,
    imageUrl: input.images?.[0] ?? "",
    images: input.images,
    optionGroups: input.optionGroups,
    isAvailable: true,
    sortOrder: 0,
  };
}

export async function createItem(
  input: {
    businessId: string;
    sortOrder: number;
    isAvailable?: boolean;
  } & ItemWriteInput,
): Promise<MenuItem> {
  if (IS_MOCK) return mockDelay(mockItem(input));
  const { businessId, ...rest } = input;
  const raw = await apiFetch<Raw>("/items", {
    method: "POST",
    body: {
      businessId,
      ...toItemBody(rest),
      isAvailable: input.isAvailable ?? true,
    },
  });
  return normalizeItem(raw, businessId);
}

export type ItemUpdateInput = {
  id: string;
  businessId: string;
} & Partial<ItemWriteInput> & {
    isAvailable?: boolean;
    sortOrder?: number;
  };

export async function updateItem(input: ItemUpdateInput): Promise<MenuItem> {
  if (IS_MOCK) return mockDelay(mockItem(input));
  const { id, businessId, ...rest } = input;
  const raw = await apiFetch<Raw>(`/items/${id}`, {
    method: "PATCH",
    body: toItemBody(rest),
  });
  return normalizeItem(raw, businessId);
}

export async function deleteItem(id: string): Promise<void> {
  if (IS_MOCK) return mockDelay(undefined);
  await apiFetch<void>(`/items/${id}`, { method: "DELETE" });
}


// ---------------------------------------------------------------------------
// Writes — orders
// ---------------------------------------------------------------------------

/**
 * The owner's two moves on the kanban: start cooking, then hand it over.
 *
 * The board's `new`/`preparing`/`ready` labels are the API's
 * `pending`/`preparing`/`ready`. The mapping lives here, in one place, so a
 * rename on either side cannot leave the board and the server disagreeing
 * about which column an order belongs in.
 */
export function toApiOrderStatus(status: OrderStatus): string {
  return status === "new" ? "pending" : status;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  if (IS_MOCK) return mockDelay({ id, status } as Order);
  const raw = await apiFetch<Raw>(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status: toApiOrderStatus(status) },
  });
  return normalizeOrder(raw);
}

// ---------------------------------------------------------------------------
// Writes — tables
// ---------------------------------------------------------------------------

export interface TableWriteInput {
  tableNumber?: string;
  status?: "available" | "occupied" | "reserved";
  waiterId?: string | null;
  seats?: number;
  shape?: string;
  x?: number;
  y?: number;
}

export async function updateTable(
  id: string,
  input: TableWriteInput,
): Promise<DiningTable> {
  if (IS_MOCK) return mockDelay({ id, ...input } as unknown as DiningTable);
  const raw = await apiFetch<Raw>(`/tables/${id}`, {
    method: "PATCH",
    body: input,
  });
  return normalizeTable(raw);
}

// ---------------------------------------------------------------------------
// Writes — the business profile
// ---------------------------------------------------------------------------

export interface BusinessProfileInput {
  name?: string;
  description?: string;
  address?: string;
  districtId?: string;
  latitude?: number;
  longitude?: number;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
  /** food_beverage only — sent as `restaurantProfile.cuisineType` */
  cuisineType?: string;
  phones?: { type: string; number: string }[];
  socialLinks?: { platform: string; url: string }[];
  images?: string[];
}

export async function updateBusinessProfile(
  businessId: string,
  input: BusinessProfileInput,
): Promise<Restaurant> {
  if (IS_MOCK) {
    return mockDelay({ ...restaurants[0]!, ...input } as unknown as Restaurant);
  }
  const { cuisineType, ...rest } = input;
  const body: Record<string, unknown> = { ...rest };
  if (cuisineType !== undefined) {
    // cuisine only exists on the food_beverage profile; sending it for a store
    // is rejected by the API's category check
    body.restaurantProfile = { cuisineType };
  }
  return apiFetch(`/businesses/${businessId}`, { method: "PATCH", body });
}

