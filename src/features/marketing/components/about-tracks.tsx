import { ShoppingBag, UtensilsCrossed } from "lucide-react";

import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * What the platform changes for each kind of business.
 *
 * Each track states its position in a paragraph, then lands it on three
 * concrete points — for restaurants the three are deliberately a widening
 * sequence (the table, past the table, then what comes back), because the
 * argument is that a QR menu is only the first of the three.
 *
 * The home page already argues restaurants-vs-stores with full-bleed
 * photography and a CTA on each card; repeating that here would be the same
 * pitch twice. This is the reading version: type, rules, and an icon, so the
 * About page keeps its own quieter voice.
 */
export function AboutTracks({ t }: { t: Dictionary }) {
  const tracks = [
    {
      icon: UtensilsCrossed,
      label: t.about.restaurantsLabel,
      title: t.about.restaurantsTitle,
      body: t.about.restaurantsBody,
      chip: "bg-berry-soft text-berry-soft-foreground",
      points: [
        {
          label: t.about.restaurantsPoint1Label,
          text: t.about.restaurantsPoint1Text,
        },
        {
          label: t.about.restaurantsPoint2Label,
          text: t.about.restaurantsPoint2Text,
        },
        {
          label: t.about.restaurantsPoint3Label,
          text: t.about.restaurantsPoint3Text,
        },
      ],
    },
    {
      icon: ShoppingBag,
      label: t.about.storesLabel,
      title: t.about.storesTitle,
      body: t.about.storesBody,
      chip: "bg-zest-soft text-zest-soft-foreground",
      points: [
        { label: t.about.storesPoint1Label, text: t.about.storesPoint1Text },
        { label: t.about.storesPoint2Label, text: t.about.storesPoint2Text },
        { label: t.about.storesPoint3Label, text: t.about.storesPoint3Text },
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <AboutEyebrow>{t.about.tracksEyebrow}</AboutEyebrow>
          <h2 className="text-display mt-4 text-3xl md:text-4xl">
            {t.about.tracksTitle}
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {tracks.map((track) => (
            <article key={track.label} className="border-t border-border pt-8">
              <span
                className={`flex size-12 items-center justify-center rounded-xl ${track.chip}`}
              >
                <track.icon className="size-6" strokeWidth={1.6} />
              </span>
              <p className="label-eyebrow mt-5 text-muted-foreground">
                {track.label}
              </p>
              <h3 className="text-display mt-2 text-2xl md:text-3xl">
                {track.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">
                {track.body}
              </p>

              <ul className="mt-7 space-y-4">
                {track.points.map((point) => (
                  <li
                    key={point.label}
                    className="border-t border-border/60 pt-4"
                  >
                    <p className="font-heading text-sm font-bold">
                      {point.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {point.text}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
