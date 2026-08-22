import Image from "next/image";
import Link from "next/link";

import { ExternalLink, MapPin, Phone, Star, UtensilsCrossed } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/shared/brand-icons";
import { Badge } from "@/components/ui/badge";
import { MapEmbed } from "@/features/marketing/components/map-embed";
import { ReviewsSection } from "@/features/marketing/components/reviews-section";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Business, Review } from "@/lib/types";

/**
 * The full details content (identity, contact, menu CTA, map, reviews).
 * Shared between the marketing details page and the isolated in-menu
 * details page (`/menu/[slug]/about`) that QR visitors are allowed to see.
 */
export function RestaurantDetailsBody({
  restaurant,
  reviews,
  governorateName,
  regionName,
  lang,
  t,
  showMenuCta = true,
  menuHref,
}: {
  restaurant: Business;
  reviews: Review[];
  governorateName: string;
  regionName: string;
  lang: Locale;
  t: Dictionary;
  showMenuCta?: boolean;
  /** override the CTA destination (e.g. /store/slug) */
  menuHref?: string;
}) {
  const separator = lang === "ar" ? "، " : ", ";

  const socials = [
    {
      label: t.restaurant.call,
      icon: Phone,
      href: `tel:${restaurant.phone.replace(/\s/g, "")}`,
      className: "bg-muted text-foreground hover:bg-surface-container-high",
    },
    {
      label: t.restaurant.whatsapp,
      icon: WhatsAppIcon,
      href: `https://wa.me/${restaurant.whatsapp.replace(/[+\s]/g, "")}`,
      className:
        "bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20 dark:text-[#4cd97f]",
    },
    restaurant.facebook && {
      label: t.restaurant.facebook,
      icon: FacebookIcon,
      href: `https://facebook.com/${restaurant.facebook}`,
      className:
        "bg-[#1877F2]/10 text-[#1462c4] hover:bg-[#1877F2]/20 dark:text-[#6ba8f5]",
    },
    restaurant.instagram && {
      label: t.restaurant.instagram,
      icon: InstagramIcon,
      href: `https://instagram.com/${restaurant.instagram}`,
      className:
        "bg-gradient-to-r from-[#f9ce34]/15 via-[#ee2a7b]/15 to-[#6228d7]/15 text-[#c13584] hover:from-[#f9ce34]/25 hover:via-[#ee2a7b]/25 hover:to-[#6228d7]/25 dark:text-[#ef7cae]",
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    className: string;
  }[];

  return (
    <div className="container-page">
      {/* identity bar — sits mostly below the gallery so nothing is cropped */}
      <div className="relative -mt-6 flex flex-wrap items-end gap-5 md:-mt-8">
        <Image
          src={restaurant.logoUrl}
          alt={restaurant.name[lang]}
          width={120}
          height={120}
          className="size-28 rounded-2xl border-4 border-background object-cover md:size-32"
        />
        <div className="flex-1 pb-1 pt-8 md:pt-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-display text-3xl md:text-4xl">
              {restaurant.name[lang]}
            </h1>
            <Badge
              className={
                restaurant.isOpen
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }
            >
              <span
                className={`me-1 size-1.5 rounded-full ${restaurant.isOpen ? "bg-success" : "bg-muted-foreground"}`}
              />
              {restaurant.isOpen ? t.restaurant.openNow : t.restaurant.closedNow}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {governorateName}
              {separator}
              {regionName}
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="size-4 fill-zest text-zest" />
              {restaurant.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 pb-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {restaurant.description[lang]}
          </p>

          {/* contact info */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">
              {t.restaurant.contactInfo}
            </h2>
            <p className="flex items-center gap-2.5 text-base font-semibold">
              <span className="flex size-9 items-center justify-center rounded-full bg-berry-soft text-berry-soft-foreground">
                <Phone className="size-4" />
              </span>
              <span dir="ltr">{restaurant.phone}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${social.className}`}
                >
                  <social.icon className="size-4" />
                  {social.label}
                </a>
              ))}
            </div>
          </section>

          {/* the one action that matters — themed with the restaurant's own color */}
          {showMenuCta && (
            <Link
              href={menuHref ?? `/${lang}/menu/${restaurant.slug}`}
              className="group flex w-full transform-gpu items-center justify-center gap-3 rounded-2xl px-8 py-5 text-lg font-bold text-white transition-transform duration-300 ease-smooth hover:scale-[1.015] md:w-auto md:min-w-96"
              style={{
                background: `linear-gradient(135deg, ${restaurant.theme.primaryColor}, color-mix(in oklch, ${restaurant.theme.primaryColor}, ${restaurant.theme.secondaryColor} 35%))`,
              }}
            >
              <UtensilsCrossed className="size-5 transition-transform group-hover:rotate-12" />
              {t.restaurant.browseMenu}
            </Link>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">
            {t.restaurant.location}
          </h2>
          <p className="text-sm text-muted-foreground">
            {restaurant.address[lang]}
          </p>
          <MapEmbed
            lat={restaurant.location.lat}
            lng={restaurant.location.lng}
            label={t.restaurant.location}
          />
          <a
            href={`https://maps.google.com/?q=${restaurant.location.lat},${restaurant.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t.restaurant.openInMaps}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      <ReviewsSection reviews={reviews} lang={lang} t={t} />
    </div>
  );
}
