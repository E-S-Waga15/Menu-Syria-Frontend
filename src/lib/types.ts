/**
 * Domain contracts shared across the platform.
 * These mirror the future REST API payloads — when the backend lands,
 * only `lib/api/client.ts` needs a base URL, the shapes stay identical.
 */

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "expired"
  | "pending";

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Governorate {
  id: string;
  name: LocalizedText;
}

export interface Region {
  id: string;
  governorateId: string;
  name: LocalizedText;
}

/**
 * The backend only returns an Arabic `name` and a coarse `category` — no
 * English translation and no direct RESTAURANT/STORE flag. The slug is
 * stable, so the frontend maps it to an English label and to our own
 * business-type split (see `BUSINESS_SUB_TYPE_LABELS` and
 * `getBusinessSubTypes` in `features/marketing/services`).
 */
export interface BusinessSubType {
  id: string;
  name: string;
  category: "food_beverage" | "retail_goods";
  slug: string;
}

export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Shared shape for anything that sells through the platform —
 * restaurants publish menus, stores publish product catalogs.
 */
export interface Business {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  logoUrl: string;
  coverImages: string[];
  governorateId: string;
  regionId: string;
  address: LocalizedText;
  location: { lat: number; lng: number };
  phone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  theme: RestaurantTheme;
  rating: number;
  isOpen: boolean;
  /** display-only reopen time (e.g. "٩:٠٠ ص") shown when closed — not a
   * real schedule, just enough for the closed-state copy on the storefront */
  opensAt?: LocalizedText;
  status: SubscriptionStatus;
  planExpiresAt: string;
  /** order channels the plan covers; omitted means both are available */
  orderChannels?: OrderChannel[];
  /**
   * Opening hours, index 0 = Sunday. `null` for a day the place is shut.
   * Omitted entirely means the owner has not published hours — a different
   * thing from being closed, and shown differently.
   */
  openingHours?: (DayHours | null)[];
}

export interface DayHours {
  opens: string;
  closes: string;
}

export interface Restaurant extends Business {
  cuisine: LocalizedText;
}

/** E-commerce storefront (clothing, electronics, gifts…) */
export interface Store extends Business {
  category: LocalizedText;
}

/** How the customer will receive their order. Restaurants support all
 * three; stores never offer dine-in (see `getSupportedFulfillment`). */
export type FulfillmentMode = "dineIn" | "pickup" | "delivery";

/**
 * How an order can be placed, which the business's plan decides: straight
 * through the platform, handed off to WhatsApp, or both. A business with only
 * one enabled shows one button, not a disabled second one.
 */
export type OrderChannel = "platform" | "whatsapp";

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: LocalizedText;
  sortOrder: number;
}

export interface StoreCategory {
  id: string;
  storeId: string;
  name: LocalizedText;
  sortOrder: number;
}

export type DishBadge = "popular" | "new" | "chefSpecial";

export type OptionSelectionType = "single" | "multiple";

export interface CatalogOption {
  id: string;
  name: LocalizedText;
  priceDelta: number;
}

/**
 * A group of related choices on a catalog item — "single" renders as an
 * exclusive pick (e.g. Size: Regular/Large, only one at a time), "multiple"
 * as independent add-ons (e.g. extra toppings, several at once).
 */
export interface CatalogOptionGroup {
  id: string;
  name: LocalizedText;
  selectionType: OptionSelectionType;
  required: boolean;
  options: CatalogOption[];
}

/**
 * Shared sellable-item shape: a dish on a menu or a product in a store.
 * The public storefront UI (cards, modal, cart, WhatsApp order) renders
 * this shape regardless of the business type behind it.
 */
export interface CatalogItem {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  imageUrl: string;
  /** extra gallery photos for the item modal; falls back to [imageUrl] */
  images?: string[];
  /** dish ingredients — or product specs/features for stores */
  ingredients?: LocalizedText[];
  optionGroups?: CatalogOptionGroup[];
  isAvailable: boolean;
  badge?: DishBadge;
  sortOrder: number;
}

export interface MenuItem extends CatalogItem {
  restaurantId: string;
}

export interface StoreProduct extends CatalogItem {
  storeId: string;
}

/** How an offer is flagged on the storefront; the copy lives in the dictionary. */
export type OfferBadge = "limited" | "bestValue" | "new";

/**
 * A promotional bundle a business publishes — a meal deal on a restaurant's
 * menu, a product bundle in a store. The same shape serves both, exactly as
 * `CatalogItem` does, so the storefront renders one component either way.
 *
 * Both prices are absolute rather than a percentage: the discount is derived
 * for display (see `offerDiscount`), never stored, so the two can never
 * disagree about what the customer actually pays.
 */
export interface Offer {
  id: string;
  /** the restaurant or store publishing it */
  businessId: string;
  name: LocalizedText;
  description: LocalizedText;
  /** cover first; the modal shows the rest as a gallery */
  images: string[];
  /** what the bundle contains — dishes for a menu, products for a store */
  includes: LocalizedText[];
  /** what the same items cost bought separately, shown struck through */
  originalPrice: number;
  /** what the customer pays for the bundle */
  price: number;
  /** ISO date the offer opens */
  startsAt: string;
  /** ISO date it closes; omitted means it runs until the owner stops it */
  endsAt?: string;
  /** the owner's on/off switch — an expired offer is a different thing */
  isActive: boolean;
  badge?: OfferBadge;
  sortOrder: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  comment: LocalizedText;
  date: string;
}

export interface Agent {
  id: string;
  name: LocalizedText;
  photoUrl: string;
  bio: LocalizedText;
  governorateId: string;
  regionId: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  restaurantsCount: number;
  status: SubscriptionStatus;
  referralCode: string;
  commissionRate: number;
}

export type OrderStatus = "new" | "preparing" | "ready";

export interface OrderLine {
  itemId: string;
  name: LocalizedText;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  /** the backend derives this from the order id ("C161A8CB"), so it is a
   * label rather than an integer — display-only, never sorted numerically */
  number: number | string;
  restaurantId: string;
  tableNumber?: number;
  customerName?: string;
  lines: OrderLine[];
  notes?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type TableShape = "square" | "round";

export interface DiningTable {
  id: string;
  number: number;
  shape: TableShape;
  seats: number;
  isOccupied: boolean;
  waiterId?: string;
  /** position on the interactive hall canvas, in % */
  x: number;
  y: number;
}

export interface Waiter {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  restaurantName: LocalizedText;
  type: "commission" | "payout";
  amount: number;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}

export interface RestaurantAnalytics {
  todayOrders: number;
  todayRevenue: number;
  menuViews: number;
  avgOrderValue: number;
  revenueByMonth: AnalyticsPoint[];
  visitsByDay: AnalyticsPoint[];
  salesByCategory: AnalyticsPoint[];
  bestSeller: MenuItem;
}

/** What a notification is about; the copy for each lives in the dictionary. */
export type NotificationKind =
  "expiringSoon" | "expired" | "renewed" | "joined";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** the business the notice concerns */
  subjectName: LocalizedText;
  /** days until expiry (or since, when already expired) */
  days?: number;
  createdAt: string;
  /** where reading it should take you */
  href?: string;
}

/** Roles the console can list and act on. Mirrors the auth store's UserRole. */
export type PlatformRole = "user" | "owner" | "agent" | "waiter" | "admin";

export interface PlatformUser {
  id: string;
  name: string;
  phone: string;
  role: PlatformRole;
  governorateId?: string;
  joinedAt: string;
  status: "active" | "banned";
}

/** A subscription tier the platform sells. */
export interface Plan {
  id: string;
  name: LocalizedText;
  /** SYP per month */
  priceMonthly: number;
  features: LocalizedText[];
  /** how many businesses are on it right now */
  subscriberCount: number;
  isPopular?: boolean;
}
