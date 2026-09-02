import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorefrontOffersScreen } from "@/features/offers/components/storefront-offers-screen";
import { getLiveOffers } from "@/features/offers/services";
import { getStoreBySlug } from "@/features/public-store/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/store/[slug]/offers">): Promise<Metadata> {
  const { lang, slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store || !isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: `${t.offers.title} — ${store.name[lang]}`,
    description: store.description[lang],
  };
}

/**
 * A store's live offers — the storefront twin of the restaurant page next to
 * it, sharing the same screen so the two never drift apart.
 */
export default async function StoreOffersPage({
  params,
}: PageProps<"/[lang]/store/[slug]/offers">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const offers = await getLiveOffers(store.id);

  return (
    <StorefrontOffersScreen
      business={store}
      menuHref={`/${lang}/store/${slug}`}
      isStore={true}
      initialOffers={offers}
    />
  );
}
