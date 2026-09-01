import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FavoritesList } from "@/features/marketing/components/favorites-list";
import { getFeaturedRestaurants, getGovernorates, getRegions } from "@/features/marketing/services";
import { getStores } from "@/features/public-store/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: t.favorites.pageTitle };
}

export default async function FavoritesPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [t, restaurants, stores, governorates, regions] = await Promise.all([
    getDictionary(lang),
    getFeaturedRestaurants(),
    getStores(),
    getGovernorates(),
    getRegions(),
  ]);

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <div className="max-w-2xl">
        <h1 className="text-display mt-3 text-3xl md:text-4xl">
          {t.favorites.pageTitle}
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {t.favorites.pageSubtitle}
        </p>
      </div>

      <div className="mt-10">
        <FavoritesList
          restaurants={restaurants}
          stores={stores}
          governorates={governorates}
          regions={regions}
          lang={lang}
          t={t}
        />
      </div>
    </main>
  );
}
