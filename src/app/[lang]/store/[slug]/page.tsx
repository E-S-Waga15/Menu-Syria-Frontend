import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuScreen } from "@/features/public-menu/components/menu-screen";
import { getPublicStoreCatalog } from "@/features/public-store/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { JsonLd, storeJsonLd } from "@/lib/seo/json-ld";
import { alternatesFor, SITE_URL } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/store/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const catalog = await getPublicStoreCatalog(slug);
  if (!catalog || !isLocale(lang)) return {};
  return {
    title: catalog.store.name[lang],
    description: catalog.store.description[lang],
    alternates: alternatesFor(lang, `/store/${slug}`),
    openGraph: {
      title: catalog.store.name[lang],
      description: catalog.store.description[lang],
      images: catalog.store.coverImages[0]
        ? [catalog.store.coverImages[0]]
        : undefined,
    },
  };
}

/** Customer-facing storefront — same isolated experience as the QR menu. */
export default async function PublicStorePage({
  params,
}: PageProps<"/[lang]/store/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [catalog, t] = await Promise.all([
    getPublicStoreCatalog(slug),
    getDictionary(lang),
  ]);
  if (!catalog) notFound();

  return (
    <>
      <JsonLd
        data={storeJsonLd(
          catalog.store,
          lang,
          `${SITE_URL}/${lang}/store/${slug}`,
        )}
      />
      <MenuScreen
        business={catalog.store}
        subtitle={catalog.store.category}
        categories={catalog.categories}
        items={catalog.products}
        governorateName={catalog.governorateName}
        regionName={catalog.regionName}
        aboutHref={`/${lang}/store/${slug}/about`}
        offersHref={`/${lang}/store/${slug}/offers`}
        copy={t.storeFront}
      />
    </>
  );
}
