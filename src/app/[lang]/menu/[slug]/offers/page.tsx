import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorefrontOffersScreen } from "@/features/offers/components/storefront-offers-screen";
import { getLiveOffers } from "@/features/offers/services";
import { getRestaurantBySlug } from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/menu/[slug]/offers">): Promise<Metadata> {
  const { lang, slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: `${t.offers.title} — ${restaurant.name[lang]}`,
    description: restaurant.description[lang],
  };
}

/**
 * A restaurant's live offers, reachable from the strip on its menu. Carries no
 * site header or footer, exactly like the sibling /about page — a QR visitor
 * gets the offers without a door into the platform.
 */
export default async function MenuOffersPage({
  params,
}: PageProps<"/[lang]/menu/[slug]/offers">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const offers = await getLiveOffers(restaurant.id);

  return (
    <StorefrontOffersScreen
      business={restaurant}
      menuHref={`/${lang}/menu/${slug}`}
      isStore={false}
      initialOffers={offers}
    />
  );
}
