/**
 * Domain contracts shared across the platform.
 * These mirror the future REST API payloads — when the backend lands,
 * only `lib/api/client.ts` needs a base URL, the shapes stay identical.
 */

export type SubscriptionStatus = "active" | "expired" | "pending";

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

export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  logoUrl: string;
  coverImages: string[];
  cuisine: LocalizedText;
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
  status: SubscriptionStatus;
  planExpiresAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: LocalizedText;
  sortOrder: number;
}

export type DishBadge = "popular" | "new" | "chefSpecial";

export interface MenuItemOption {
  id: string;
  name: LocalizedText;
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  imageUrl: string;
  /** extra gallery photos for the dish modal; falls back to [imageUrl] */
  images?: string[];
  ingredients?: LocalizedText[];
  options?: MenuItemOption[];
  isAvailable: boolean;
  badge?: DishBadge;
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

export interface TeamMember {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  photoUrl: string;
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
  number: number;
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
