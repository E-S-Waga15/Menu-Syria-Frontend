import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RestaurantDetailsBody } from "@/features/marketing/components/restaurant-details-body";
import { RestaurantGallery } from "@/features/marketing/components/restaurant-gallery";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { getStoreBySlug } from "@/features/public-store/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  breadcrumbsJsonLd,
  JsonLd,
  storeJsonLd,
} from "@/lib/seo/json-ld";
import { alternatesFor, SITE_URL } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/stores/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const store = await getStoreBySlug(slug);
  if (!store) return {};
  return {
    title: store.name[lang],
    description: store.description[lang],
    alternates: alternatesFor(lang, `/stores/${slug}`),
    openGraph: {
      title: store.name[lang],
      description: store.description[lang],
      images: store.coverImages[0] ? [store.coverImages[0]] : undefined,
    },
  };
}

/**
 * Store details page reached from the `/stores` directory — mirrors the
 * restaurant details page so store cards no longer jump straight into the
 * chrome-less storefront (`/store/[slug]`).
 */
export default async function StoreDetailsPage({
  params,
}: PageProps<"/[lang]/stores/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [t, store] = await Promise.all([
    getDictionary(lang),
    getStoreBySlug(slug),
  ]);
  if (!store) notFound();

  const [governorates, regions] = await Promise.all([
    getGovernorates(),
    getRegions(),
  ]);

  const governorateName =
    governorates.find((g) => g.id === store.governorateId)?.name[lang] ?? "";
  const regionName =
    regions.find((r) => r.id === store.regionId)?.name[lang] ?? "";

  const pageUrl = `${SITE_URL}/${lang}/stores/${slug}`;

  return (
    <main className="pt-16">
      <JsonLd data={storeJsonLd(store, lang, pageUrl)} />
      <JsonLd
        data={breadcrumbsJsonLd([
          { name: t.nav.home, url: `${SITE_URL}/${lang}` },
          { name: t.nav.stores, url: `${SITE_URL}/${lang}/stores` },
          { name: store.name[lang], url: pageUrl },
        ])}
      />
      <RestaurantGallery images={store.coverImages} />
      <RestaurantDetailsBody
        restaurant={store}
        reviews={[]}
        governorateName={governorateName}
        regionName={regionName}
        lang={lang}
        t={t}
        menuHref={`/${lang}/store/${slug}`}
      />
    </main>
  );
}
