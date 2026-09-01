import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * The page's signature.
 *
 * A printed menu has one unmistakable typographic device: the dish on one
 * side, its price on the other, joined by a run of leader dots. This section
 * sets what the platform offers on exactly that armature — the capability
 * where the dish goes, what it gets you where the price goes.
 *
 * It borrows the subject's own vernacular instead of a card grid, it carries
 * no elevation (a dotted rule is flat by construction), and the leader stretches
 * with `flex-1`, so it reads correctly in both writing directions.
 *
 * Not numbered: these are things offered at once, not steps in an order.
 * Ordinals would claim a sequence the content does not have.
 */
export function AboutOffering({ t }: { t: Dictionary }) {
  const items = [
    { name: t.about.offer1Name, value: t.about.offer1Value },
    { name: t.about.offer2Name, value: t.about.offer2Value },
    { name: t.about.offer3Name, value: t.about.offer3Value },
    { name: t.about.offer4Name, value: t.about.offer4Value },
    { name: t.about.offer5Name, value: t.about.offer5Value },
    { name: t.about.offer6Name, value: t.about.offer6Value },
  ];

  return (
    <section className="bg-surface-container-low py-16 md:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <AboutEyebrow>{t.about.offerEyebrow}</AboutEyebrow>
          <h2 className="text-display mt-4 text-3xl md:text-4xl">
            {t.about.offerTitle}
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">
            {t.about.offerBody}
          </p>
        </div>

        <ul className="mx-auto mt-12 max-w-4xl">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex items-baseline gap-3 border-t border-border/70 py-5 first:border-t-0 md:gap-5 md:py-6"
            >
              <span className="font-heading text-base font-bold md:text-xl">
                {item.name}
              </span>
              {/* the leader: a dotted rule that fills whatever space is left */}
              <span
                aria-hidden
                className="h-0 min-w-6 flex-1 -translate-y-1 border-b border-dotted border-muted-foreground/40"
              />
              <span className="shrink-0 text-sm text-muted-foreground md:text-base">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
