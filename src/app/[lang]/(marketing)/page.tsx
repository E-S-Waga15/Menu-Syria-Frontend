import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { AgentsSection } from "@/features/marketing/components/agents-section";
import { SectorsSection } from "@/features/marketing/components/sectors-section";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { Faq } from "@/features/marketing/components/faq-section";
import { Hero } from "@/features/marketing/components/hero";
import { HomeSwitch } from "@/features/marketing/components/home-switch";
import { RestaurantsMarquee } from "@/features/marketing/components/restaurants-marquee";
import { Services } from "@/features/marketing/components/services";
import { StatsTeam } from "@/features/marketing/components/stats-team";
import {
  getAgents,
  getFeaturedRestaurants,
  getGovernorates,
} from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [t, restaurants, agents, governorates] = await Promise.all([
    getDictionary(lang),
    getFeaturedRestaurants(),
    getAgents(),
    getGovernorates(),
  ]);

  return (
    <HomeSwitch
      marketing={
        <main>
          <JsonLd
            data={organizationJsonLd(t.seo.siteName, t.seo.homeDescription)}
          />
          <JsonLd data={websiteJsonLd(t.seo.siteName, lang)} />
          <Hero lang={lang} t={t} />
          <Reveal>
            <RestaurantsMarquee lang={lang} t={t} restaurants={restaurants} />
          </Reveal>
          <Reveal>
            <SectorsSection lang={lang} t={t} />
          </Reveal>
          <Reveal>
            <Services t={t} />
          </Reveal>
          <Reveal>
            <AgentsSection
              lang={lang}
              t={t}
              agents={agents}
              governorates={governorates}
            />
          </Reveal>
          <Reveal>
            <StatsTeam t={t} />
          </Reveal>
          <Reveal>
            <Faq t={t} />
          </Reveal>
          <Reveal>
            <CtaBand lang={lang} t={t} />
          </Reveal>
        </main>
      }
    />
  );
}
