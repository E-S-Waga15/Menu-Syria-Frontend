import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import { offers, restaurants, stores } from "@/lib/mock/data";
import type { Business, CatalogItem, Offer } from "@/lib/types";

/**
 * Whether an offer should be visible to a customer right now.
 *
 * Two separate things have to be true: the owner has it switched on, and today
 * falls inside its window. Keeping them separate is what lets the dashboard
 * show "expired" and "paused" as different states rather than one dead flag.
 */
export function isOfferLive(offer: Offer, now = new Date()): boolean {
  if (!offer.isActive) return false;
  const today = now.toISOString().slice(0, 10);
  if (offer.startsAt > today) return false;
  return !offer.endsAt || offer.endsAt >= today;
}

/**
 * `upcoming`, `endingSoon` and `expired` are windows; `paused` is the owner's
 * own switch. `endingSoon` exists so the owner sees what needs a decision this
 * week without opening each card to read a date.
 */
export type OfferState =
  | "live"
  | "endingSoon"
  | "paused"
  | "upcoming"
  | "expired";

/** how close to its end date an offer starts flagging itself */
const ENDING_SOON_DAYS = 7;

export function offerState(offer: Offer, now = new Date()): OfferState {
  const today = now.toISOString().slice(0, 10);
  if (offer.endsAt && offer.endsAt < today) return "expired";
  if (!offer.isActive) return "paused";
  if (offer.startsAt > today) return "upcoming";

  if (offer.endsAt) {
    const daysLeft = Math.ceil(
      (new Date(offer.endsAt).getTime() - now.getTime()) / 86_400_000,
    );
    if (daysLeft <= ENDING_SOON_DAYS) return "endingSoon";
  }
  return "live";
}

/**
 * The saving, derived rather than stored — a percentage kept alongside the two
 * prices would be a third number free to drift out of step with them.
 * Returns 0 when the "original" price is not actually higher.
 */
export function offerDiscount(offer: Offer): number {
  if (offer.originalPrice <= offer.price) return 0;
  return Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100,
  );
}

/**
 * An offer, seen as something the cart can hold.
 *
 * The cart, the checkout sheet and the WhatsApp message all speak
 * `CatalogItem`. Rather than teach each of them a second shape, an offer is
 * adapted into one: its bundle contents become the item's `ingredients`, which
 * is what the modal already renders as a list. The `offer-` id prefix keeps it
 * from ever colliding with a real dish.
 */
export function offerAsCatalogItem(offer: Offer): CatalogItem {
  return {
    id: `offer-${offer.id}`,
    categoryId: "offers",
    name: offer.name,
    description: offer.description,
    price: offer.price,
    imageUrl: offer.images[0] ?? "",
    images: offer.images,
    ingredients: offer.includes,
    isAvailable: true,
    sortOrder: offer.sortOrder,
  };
}

/** Every offer a business has, in the owner's own order — dashboard view. */
export async function getBusinessOffers(businessId: string): Promise<Offer[]> {
  if (IS_MOCK) {
    return mockDelay(
      offers
        .filter((o) => o.businessId === businessId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      250,
    );
  }
  return apiFetch(`/businesses/${businessId}/offers`);
}

/** Only what a customer should see on the storefront. */
export async function getLiveOffers(businessId: string): Promise<Offer[]> {
  if (IS_MOCK) {
    return mockDelay(
      offers
        .filter((o) => o.businessId === businessId && isOfferLive(o))
        .sort((a, b) => a.sortOrder - b.sortOrder),
      200,
    );
  }
  return apiFetch(`/businesses/${businessId}/offers?live=1`);
}

/**
 * An offer plus the business behind it, for the places that mix offers from
 * several storefronts — the signed-in customer's home page. The storefront
 * kind decides which route the card links to, since restaurants live under
 * `/menu` and stores under `/store`.
 */
export interface FeaturedOffer {
  offer: Offer;
  business: Business;
  kind: "restaurant" | "store";
}

export async function getFeaturedOffers(limit = 6): Promise<FeaturedOffer[]> {
  if (IS_MOCK) {
    const byId = new Map<
      string,
      { business: Business; kind: "restaurant" | "store" }
    >([
      ...restaurants.map(
        (r) =>
          [
            r.id,
            { business: r as Business, kind: "restaurant" as const },
          ] as const,
      ),
      ...stores.map(
        (s) =>
          [s.id, { business: s as Business, kind: "store" as const }] as const,
      ),
    ]);

    return mockDelay(
      offers
        .filter((o) => isOfferLive(o))
        .flatMap((offer) => {
          const source = byId.get(offer.businessId);
          // an offer whose business is gone is not renderable, so it is
          // dropped rather than shown with a blank name
          return source
            ? [{ offer, business: source.business, kind: source.kind }]
            : [];
        })
        .slice(0, limit),
      250,
    );
  }
  return apiFetch(`/offers/featured?limit=${limit}`);
}
