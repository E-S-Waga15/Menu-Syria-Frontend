"use client";

import Image from "next/image";
import Link from "next/link";

import { Heart, MapPin, Star } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";

export function RestaurantCard({
  restaurant,
  locationLabel,
  href,
}: {
  restaurant: Business;
  locationLabel: string;
  /** defaults to the restaurant details page */
  href?: string;
}) {
  const { t, lang } = useI18n();
  const isFavorite = useFavoritesStore((s) => s.ids.includes(restaurant.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  return (
    <article className="group relative transform-gpu overflow-hidden rounded-2xl border border-border/60 bg-card transition-[translate,scale,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-primary/35">
      <Link
        href={href ?? `/${lang}/restaurants/${restaurant.slug}`}
        className="block outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={restaurant.coverImages[0] ?? restaurant.logoUrl}
            alt={restaurant.name[lang]}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transform-gpu object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          {/* glass rating chip */}
          <span className="absolute bottom-3 start-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            <Star className="size-3.5 fill-zest text-zest" />
            {restaurant.rating}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={restaurant.logoUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-xl border border-border object-cover"
            />
            <div className="min-w-0">
              <h3 className="truncate font-heading font-bold">
                {restaurant.name[lang]}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {locationLabel}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* glass favorite button on the image corner */}
      <button
        type="button"
        aria-label={t.restaurant.favorite}
        aria-pressed={isFavorite}
        onClick={() => toggleFavorite(restaurant.id)}
        className={cn(
          "absolute end-3 top-3 flex size-10 transform-gpu items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-[translate,scale,color] duration-200 ease-smooth hover:scale-110 active:scale-95",
          isFavorite ? "text-primary" : "text-white",
        )}
      >
        <Heart
          className={cn(
            "size-5 transition-transform duration-200",
            isFavorite && "scale-110 fill-current",
          )}
        />
      </button>
    </article>
  );
}
