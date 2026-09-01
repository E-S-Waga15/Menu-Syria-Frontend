import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Vision and mission on the berry ground — the one inverted band on the page,
 * so the two statements that matter most are also the only place the reader's
 * eye is pulled fully out of the document.
 *
 * The two halves are divided by a hairline rather than boxed separately: they
 * are one position stated twice, not two features.
 */
export function AboutPrinciples({ t }: { t: Dictionary }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div // Pinned to the light-mode berries. `--berry-bright` re-tones to a hot
          // #e0446f in dark, so the far end of this band glared against a dark
          // page; these are the same three stops the closing CTA band uses.
          className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#850036] via-[#9c0242] to-[#b0004a] px-6 py-14 text-white md:px-14 md:py-16"
        >
          <AboutEyebrow tone="inverse">{t.about.visionEyebrow}</AboutEyebrow>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <h2 className="text-display text-2xl md:text-3xl">
                {t.about.visionTitle}
              </h2>
              <p className="mt-4 leading-relaxed text-white/80 md:text-lg">
                {t.about.visionBody}
              </p>
            </div>

            {/* hairline divider: vertical beside, horizontal stacked */}
            <div className="border-t border-white/15 pt-10 md:border-t-0 md:border-s md:pt-0 md:ps-14">
              <h2 className="text-display text-2xl md:text-3xl">
                {t.about.missionTitle}
              </h2>
              <p className="mt-4 leading-relaxed text-white/80 md:text-lg">
                {t.about.missionBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The commitments. Held still — no hover lift — because they are statements to
 * be read, not destinations to be clicked.
 */
export function AboutValues({ t }: { t: Dictionary }) {
  const values = [
    { title: t.about.value1Title, body: t.about.value1Body },
    { title: t.about.value2Title, body: t.about.value2Body },
    { title: t.about.value3Title, body: t.about.value3Body },
    { title: t.about.value4Title, body: t.about.value4Body },
  ];

  return (
    <section className="pb-16 md:pb-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <AboutEyebrow>{t.about.valuesEyebrow}</AboutEyebrow>
          <h2 className="text-display mt-4 text-3xl md:text-4xl">
            {t.about.valuesTitle}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="border-t border-border pt-6">
              <h3 className="font-heading text-lg font-bold md:text-xl">
                {value.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
