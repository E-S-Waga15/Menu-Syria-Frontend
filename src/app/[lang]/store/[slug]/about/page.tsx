import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RestaurantDetailsBody } from "@/features/marketing/components/restaurant-details-body";
import { RestaurantGallery } from "@/features/marketing/components/restaurant-gallery";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { BackToMenuBar } from "@/features/public-menu/components/back-to-menu-bar";
import { getStoreBySlug } from "@/features/public-store/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/store/[slug]/about">): Promise<Metadata> {
  const { lang, slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store || !isLocale(lang)) return {};
  return {
    title: store.name[lang],
    description: store.description[lang],
  };
}

/**
 * Store details reachable from the public storefront — renders with no site
 * header, nav, or footer, mirroring the QR-menu privacy model.
 */
export default async function StoreAboutPage({
  params,
}: PageProps<"/[lang]/store/[slug]/about">) {
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

  return (
    <main className="pt-14">
      <BackToMenuBar
        menuHref={`/${lang}/store/${slug}`}
        label={t.storeFront.backToMenu}
      />
      <RestaurantGallery images={store.coverImages} />
      <RestaurantDetailsBody
        restaurant={store}
        reviews={[]}
        governorateName={governorateName}
        regionName={regionName}
        lang={lang}
        t={t}
        showMenuCta={false}
      />
    </main>
  );
}
