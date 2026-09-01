import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Type-led opening: the thesis stated plainly, with the turn of the sentence
 * carried by colour — the condition in ink, the promise in berry.
 *
 * Deliberately holds no stat row. The home hero already counts restaurants and
 * cities; repeating them here would trade the argument for filler.
 */
export function AboutHero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-surface-container-low pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-page">
        <div className="max-w-4xl">
          <AboutEyebrow className="animate-fade-up">
            {t.about.heroEyebrow}
          </AboutEyebrow>

          <h1
            className="text-display mt-6 animate-fade-up text-3xl leading-tight md:text-5xl xl:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            {t.about.heroTitle1}
            <br />
            <span className="text-primary">{t.about.heroTitle2}</span>
          </h1>

          <p
            className="mt-7 max-w-2xl animate-fade-up text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "180ms" }}
          >
            {t.about.heroBody}
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-wrap items-center gap-3"
            style={{ animationDelay: "270ms" }}
          >
            <Button
              className="h-12 px-7 text-base"
              render={<Link href={`/${lang}/register/restaurant`} />}
            >
              {t.home.heroCtaPrimary}
              <Arrow className="size-4.5" />
            </Button>
            <Button
              variant="outline"
              className="h-12 border-[1.5px] px-7 text-base"
              render={<Link href={`/${lang}/restaurants`} />}
            >
              {t.nav.restaurants}
            </Button>
          </div>
        </div>
      </div>

      {/* the mark's three menu lines, abstracted into the page's architecture —
          full-bleed hairlines with the saffron one held short, exactly as the
          logo holds it */}
      <div aria-hidden className="mt-16 space-y-2.5 md:mt-24">
        <div className="h-px w-full bg-border" />
        <div className="h-0.5 w-1/3 bg-zest" />
        <div className="h-px w-2/3 bg-border" />
      </div>
    </section>
  );
}
