import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * The argument, then the evidence: prose on one side, and on the other the
 * gap it describes stated as two stacked panels — today, and with the
 * platform. The panels are separated by tone and a single accent edge rather
 * than by elevation, which is how the rest of the site draws separation.
 */
export function AboutStory({ t }: { t: Dictionary }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="max-w-2xl">
          <AboutEyebrow>{t.about.storyEyebrow}</AboutEyebrow>
          <h2 className="text-display mt-4 text-3xl md:text-4xl">
            {t.about.storyTitle}
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground md:text-lg">
            {t.about.storyP1}
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">
            {t.about.storyP2}
          </p>
        </div>

        <div className="space-y-4 self-center">
          {/* today: muted ground, neutral edge */}
          <div className="rounded-2xl border border-border/60 border-s-2 border-s-border bg-surface-container-low p-6">
            <p className="label-eyebrow text-muted-foreground">
              {t.about.beforeLabel}
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t.about.beforeText}
            </p>
          </div>

          {/* with the platform: the same shape, carried by the brand edge */}
          <div className="rounded-2xl border border-border/60 border-s-2 border-s-primary bg-card p-6">
            <p className="label-eyebrow text-primary">{t.about.afterLabel}</p>
            <p className="mt-3 leading-relaxed text-foreground">
              {t.about.afterText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
