import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/** "Two sectors, one platform" — the dual-positioning statement of the home page. */
export function SectorsSection({ lang, t }: { lang: Locale; t: Dictionary }) {
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const sectors = [
    {
      icon: UtensilsCrossed,
      title: t.home.sectorRestaurantTitle,
      body: t.home.sectorRestaurantBody,
      cta: t.home.sectorRestaurantCta,
      href: `/${lang}/register/restaurant`,
      image:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
      // same dark wash as the store card: the berry overlay tinted the
      // photo red and the white copy on top of it stopped being legible
      accent: "from-zest-foreground/85 via-zest-foreground/40",
      chip: "bg-[#ffd9de] text-[#90003b]",
    },
    {
      icon: ShoppingBag,
      title: t.home.sectorStoreTitle,
      body: t.home.sectorStoreBody,
      cta: t.home.sectorStoreCta,
      href: `/${lang}/register/store`,
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
      accent: "from-zest-foreground/85 via-zest-foreground/40",
      chip: "bg-zest-soft text-zest-soft-foreground",
    },
  ];

  return (
    <section id="sectors" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-eyebrow text-primary">{t.home.sectorsEyebrow}</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            {t.home.sectorsTitle}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {t.home.sectorsBody}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {sectors.map((sector) => (
            <article
              key={sector.title}
              className="group relative flex min-h-[26rem] transform-gpu flex-col justify-end overflow-hidden rounded-3xl transition-[translate,scale] duration-300 ease-smooth hover:-translate-y-1"
            >
              <Image
                src={sector.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="transform-gpu object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${sector.accent} to-transparent`}
              />

              <div className="relative p-7 text-white md:p-9">
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-2xl ${sector.chip}`}
                >
                  <sector.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
                  {sector.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-white/85">
                  {sector.body}
                </p>
                <Link
                  href={sector.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-foreground transition-transform duration-200 ease-smooth hover:scale-[1.03] dark:text-[#191c1d]"
                >
                  {sector.cta}
                  <Arrow className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
