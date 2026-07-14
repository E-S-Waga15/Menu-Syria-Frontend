import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { AgentsSection } from "@/features/marketing/components/agents-section";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { Hero } from "@/features/marketing/components/hero";
import { RestaurantsMarquee } from "@/features/marketing/components/restaurants-marquee";
import { Services } from "@/features/marketing/components/services";
import { StatsTeam } from "@/features/marketing/components/stats-team";
import {
  getFeaturedRestaurants,
  getTeam,
} from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [t, restaurants, team] = await Promise.all([
    getDictionary(lang),
    getFeaturedRestaurants(),
    getTeam(),
  ]);

  return (
    <main>
      <Hero lang={lang} t={t} />
      <Reveal>
        <RestaurantsMarquee lang={lang} t={t} restaurants={restaurants} />
      </Reveal>
      <Reveal>
        <Services t={t} />
      </Reveal>
      <Reveal>
        <AgentsSection />
      </Reveal>
      <Reveal>
        <StatsTeam lang={lang} t={t} team={team} />
      </Reveal>
      <Reveal>
        <CtaBand lang={lang} t={t} />
      </Reveal>
    </main>
  );
}
