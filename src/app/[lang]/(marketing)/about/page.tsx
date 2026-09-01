import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { AboutHero } from "@/features/marketing/components/about-hero";
import { AboutOffering } from "@/features/marketing/components/about-offering";
import {
  AboutPrinciples,
  AboutValues,
} from "@/features/marketing/components/about-principles";
import { AboutStory } from "@/features/marketing/components/about-story";
import { AboutTracks } from "@/features/marketing/components/about-tracks";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    alternates: alternatesFor(lang, "/about"),
    openGraph: {
      title: t.about.metaTitle,
      description: t.about.metaDescription,
    },
    // the root layout sets a twitter card from seo.homeDescription; without
    // this the About card would still advertise the home page's pitch
    twitter: {
      title: t.about.metaTitle,
      description: t.about.metaDescription,
    },
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main>
      {/* the hero animates on load; everything below reveals on scroll, the
          same rhythm the home page uses */}
      <AboutHero lang={lang} t={t} />
      <Reveal>
        <AboutStory t={t} />
      </Reveal>
      <Reveal>
        <AboutTracks t={t} />
      </Reveal>
      <Reveal>
        <AboutOffering t={t} />
      </Reveal>
      <Reveal>
        <AboutPrinciples t={t} />
      </Reveal>
      <Reveal>
        <AboutValues t={t} />
      </Reveal>
      <Reveal>
        <CtaBand lang={lang} t={t} />
      </Reveal>
    </main>
  );
}
