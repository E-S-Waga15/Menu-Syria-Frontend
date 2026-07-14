"use client";

import { useState } from "react";

import { MapPin } from "lucide-react";

/**
 * Google Maps embed guarded by a click-to-activate layer so page scrolling
 * on mobile never gets hijacked by the map.
 */
export function MapEmbed({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-72 overflow-hidden rounded-2xl border border-border/60 shadow-soft md:h-80">
      <iframe
        title={label}
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
        className="size-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {!active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/5 backdrop-blur-[1px] transition-colors hover:bg-black/10"
        >
          <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-lifted">
            <MapPin className="size-4 text-primary" />
            {label}
          </span>
        </button>
      )}
    </div>
  );
}
