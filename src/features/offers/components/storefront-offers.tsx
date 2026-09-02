"use client";

import Link from "next/link";

import { ArrowLeft, ArrowRight, Tag } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { Offer } from "@/lib/types";

/**
 * The offers strip on a storefront.
 *
 * Deliberately a single quiet line rather than a rail of cards: the menu
 * itself is what this page is for, and a customer who came to order should not
 * have to scroll past a carousel to reach it. The strip says offers exist and
 * offers one way in.
 *
 * That way in is a link to the storefront's own offers page, not a dialog. A
 * list with as many entries as the owner cares to publish wants the whole
 * viewport on a phone, wants a back button, and wants to be linkable — none of
 * which a modal gives it.
 *
 * Renders nothing at all when there are no live offers — an empty "Featured
 * offers" heading would only advertise their absence.
 */
export function StorefrontOffers({
  offers,
  isStore,
  offersHref,
}: {
  offers: Offer[];
  /** switches the strip's line between "this restaurant" and "this store" */
  isStore: boolean;
  offersHref: string;
}) {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (offers.length === 0) return null;

  return (
    <section className="pt-2">
      <Link
        href={offersHref}
        className="group/strip flex items-center gap-3 rounded-2xl border border-[var(--menu-primary)]/25 bg-[var(--menu-primary)]/5 p-3.5 transition-colors duration-200 hover:border-[var(--menu-primary)]/45 sm:p-4"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--menu-primary)] text-white">
          <Tag className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-bold sm:text-lg">
            {t.offers.browseTitle}
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {isStore ? t.offers.browseBodyStore : t.offers.browseBody}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--menu-primary)] px-3.5 py-2 text-xs font-bold text-white transition-opacity group-hover/strip:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm">
          {t.offers.browseCta}
          <Arrow className="size-3.5 transition-[translate] duration-200 ease-smooth group-hover/strip:-translate-x-0.5 rtl:group-hover/strip:translate-x-0.5" />
        </span>
      </Link>
    </section>
  );
}
