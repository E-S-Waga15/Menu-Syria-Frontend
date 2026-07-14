import { notFound } from "next/navigation";

import { RestaurantsGrid } from "@/features/marketing/components/restaurants-grid";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function RestaurantsPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <div className="max-w-2xl">
        <p className="label-eyebrow text-primary">
          {t.home.restaurantsEyebrow}
        </p>
        <h1 className="text-display mt-3 text-3xl md:text-4xl">
          {t.restaurantsPage.title}
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {t.restaurantsPage.subtitle}
        </p>
      </div>

      <div className="mt-10">
        <RestaurantsGrid />
      </div>
    </main>
  );
}
