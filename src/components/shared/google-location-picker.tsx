"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AlertCircle, Loader2, Search, Target } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { Governorate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GoogleLocationPickerProps {
  onLocationChange?: (coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number };
  className?: string;
  selectedGovernorateId?: string;
  governorates?: Governorate[];
}

const DEFAULT_COORDS = { lat: 33.5138, lng: 36.2765 }; // Damascus

/** Minimal surface of the Maps JS SDK objects this component touches —
 * the full SDK has no first-party types package, so these are hand-typed
 * to the handful of methods actually called below. */
interface GoogleLatLng {
  lat(): number;
  lng(): number;
}
interface GoogleMapInstance {
  panTo(pos: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  addListener(event: string, handler: (e: { latLng: GoogleLatLng }) => void): void;
}
interface GoogleMarkerInstance {
  getPosition(): GoogleLatLng;
  setPosition(pos: { lat: number; lng: number }): void;
  addListener(event: string, handler: () => void): void;
}
interface GoogleAutocompleteInstance {
  addListener(event: string, handler: () => void): void;
  getPlace(): { geometry?: { location?: GoogleLatLng } };
}
interface GoogleGeocoderInstance {
  geocode(request: {
    address: string;
  }): Promise<{ results: { geometry: { location: GoogleLatLng } }[] }>;
}
interface GoogleMapsLibraries {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapInstance;
  Marker: new (opts: {
    position: { lat: number; lng: number };
    map: GoogleMapInstance;
    draggable?: boolean;
  }) => GoogleMarkerInstance;
  Autocomplete: new (
    input: HTMLInputElement,
    opts: Record<string, unknown>,
  ) => GoogleAutocompleteInstance;
  Geocoder: new () => GoogleGeocoderInstance;
}

/**
 * Google's own bootstrap loader — sets up `google.maps.importLibrary`. The
 * old `<script src="...&libraries=places">` + wait-for-onload pattern races
 * with `loading=async` and can leave `google.maps.places` undefined even
 * after the script "loads" with no console error at all; this is the
 * version Google's current docs recommend instead. Copied close to verbatim
 * from Google's own snippet, so it's exempted from the no-`any` rule below —
 * it's dynamic script-injection bootstrapping that runs before any SDK
 * types exist, not application logic worth hand-typing.
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions */
function installBootstrapLoader(apiKey: string) {
  if ((window as any).google?.maps?.importLibrary) return;
  ((g: any) => {
    let h: any, a: any, k: string, b: any = window as any;
    const p = "The Google Maps JavaScript API";
    const c = "google", l = "importLibrary", q = "__ib__", m = document;
    b = b[c] || (b[c] = {});
    const d = b.maps || (b.maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = (m.querySelector("script[nonce]") as HTMLScriptElement)?.nonce || "";
        m.head.append(a);
      }));
    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : (d[l] = (f: string, ...n: unknown[]) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key: apiKey, v: "weekly" });
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions */

interface GoogleMapsNamespace {
  maps: { importLibrary: (name: string) => Promise<Record<string, unknown>> };
}

let librariesLoader: Promise<GoogleMapsLibraries> | null = null;
function loadGoogleMaps(apiKey: string): Promise<GoogleMapsLibraries> {
  if (librariesLoader) return librariesLoader;
  installBootstrapLoader(apiKey);
  const google = (window as unknown as { google: GoogleMapsNamespace }).google;
  librariesLoader = Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("places"),
    google.maps.importLibrary("geocoding"),
  ]).then(([mapsLib, markerLib, placesLib, geocodingLib]) => ({
    Map: mapsLib.Map as GoogleMapsLibraries["Map"],
    Marker: markerLib.Marker as GoogleMapsLibraries["Marker"],
    Autocomplete: placesLib.Autocomplete as GoogleMapsLibraries["Autocomplete"],
    Geocoder: geocodingLib.Geocoder as GoogleMapsLibraries["Geocoder"],
  }));
  return librariesLoader;
}

/**
 * Interactive Google Maps location picker: search-to-place, click-to-place,
 * or drag the marker. Needs `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — degrades to
 * a friendly inline error (never a crash) when it's missing.
 */
export function GoogleLocationPicker({
  onLocationChange,
  initialCoords = DEFAULT_COORDS,
  className,
  selectedGovernorateId,
  governorates = [],
}: GoogleLocationPickerProps) {
  const { t, lang } = useI18n();
  const [coords, setCoords] = useState(initialCoords);
  const [isMapReady, setIsMapReady] = useState(false);
  // Computed at first render (not inside the effect below) so the "no key"
  // case never needs a synchronous setState from within an effect body.
  const [loadError, setLoadError] = useState(
    () => !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [autoCenterError, setAutoCenterError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<GoogleMapInstance | null>(null);
  const markerInstance = useRef<GoogleMarkerInstance | null>(null);
  const geocoderRef = useRef<GoogleGeocoderInstance | null>(null);
  const autocompleteRef = useRef<GoogleAutocompleteInstance | null>(null);
  // Once the user has manually placed the pin (click, drag, or search),
  // governorate changes stop auto-recentering the map — respects whatever
  // they've already chosen instead of silently overwriting it.
  const hasManualPinRef = useRef(false);
  const lastGeocodedQueryRef = useRef<string>("");

  const emitLocation = useCallback(
    (next: { lat: number; lng: number }) => {
      setCoords(next);
      onLocationChange?.(next);
    },
    [onLocationChange],
  );

  // Load the SDK once, then build the map.
  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    loadGoogleMaps(apiKey)
      .then(({ Map, Marker, Autocomplete, Geocoder }) => {
        if (cancelled || !mapContainerRef.current || mapInstance.current) return;
        const map = new Map(mapContainerRef.current, {
          center: coords,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        const marker = new Marker({ position: coords, map, draggable: true });
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          hasManualPinRef.current = true;
          emitLocation({ lat: pos.lat(), lng: pos.lng() });
        });
        map.addListener("click", (e) => {
          const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          marker.setPosition(next);
          hasManualPinRef.current = true;
          emitLocation(next);
        });

        mapInstance.current = map;
        markerInstance.current = marker;
        geocoderRef.current = new Geocoder();

        if (searchInputRef.current) {
          const autocomplete = new Autocomplete(searchInputRef.current, {
            fields: ["geometry", "name"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const loc = place.geometry?.location;
            if (!loc) {
              setSearchError(true);
              return;
            }
            setSearchError(false);
            const next = { lat: loc.lat(), lng: loc.lng() };
            hasManualPinRef.current = true;
            map.panTo(next);
            map.setZoom(14);
            marker.setPosition(next);
            emitLocation(next);
          });
          autocompleteRef.current = autocomplete;
        }

        setIsMapReady(true);
        onLocationChange?.(coords);
      })
      .catch((err) => {
        console.error("GoogleLocationPicker failed to load Google Maps:", err);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerMapSearch = async () => {
    const query = searchQuery.trim();
    if (!query || isSearching || !geocoderRef.current) return;
    setIsSearching(true);
    setSearchError(false);
    try {
      const result = await geocoderRef.current.geocode({ address: query });
      const first = result?.results?.[0];
      const loc = first?.geometry?.location;
      if (!loc) {
        setSearchError(true);
        return;
      }
      const next = { lat: loc.lat(), lng: loc.lng() };
      hasManualPinRef.current = true;
      mapInstance.current?.panTo(next);
      mapInstance.current?.setZoom(14);
      markerInstance.current?.setPosition(next);
      emitLocation(next);
    } catch {
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-center once per actual governorate change — never after the user
  // has taken manual control of the pin.
  useEffect(() => {
    if (!isMapReady || hasManualPinRef.current || !selectedGovernorateId) return;
    const gov = governorates.find((g) => g.id === selectedGovernorateId);
    const govName = gov?.name[lang] ?? selectedGovernorateId;
    const query = `${govName}, Syria`;
    if (lastGeocodedQueryRef.current === query) return;
    lastGeocodedQueryRef.current = query;

    const timeout = setTimeout(async () => {
      if (!geocoderRef.current) return;
      try {
        const result = await geocoderRef.current.geocode({ address: query });
        const loc = result?.results?.[0]?.geometry?.location;
        if (!loc || hasManualPinRef.current) return;
        const next = { lat: loc.lat(), lng: loc.lng() };
        mapInstance.current?.panTo(next);
        markerInstance.current?.setPosition(next);
        emitLocation(next);
        setAutoCenterError(false);
      } catch (err) {
        console.error("GoogleLocationPicker: governorate geocode failed:", err);
        setAutoCenterError(true);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [selectedGovernorateId, isMapReady, governorates, lang, emitLocation]);

  // Auto-dismiss the "couldn't auto-center" hint — it's informational.
  useEffect(() => {
    if (!autoCenterError) return;
    const timeout = setTimeout(() => setAutoCenterError(false), 3000);
    return () => clearTimeout(timeout);
  }, [autoCenterError]);

  if (loadError) {
    return (
      <div
        className={cn(
          "flex h-72 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted/30",
          className,
        )}
      >
        <AlertCircle className="text-destructive" size={28} />
        <span className="px-6 text-center text-xs text-muted-foreground">
          {t.auth.locationMapLoadError}
        </span>
      </div>
    );
  }

  return (
    <section className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t.auth.locationSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  triggerMapSearch();
                }
              }}
              className={cn(
                "h-11 w-full rounded-xl border border-input bg-transparent ps-10 pe-3 text-sm outline-none transition-colors focus-visible:border-primary/60",
                searchError && "border-destructive",
              )}
            />
          </div>
          <button
            type="button"
            disabled={isSearching}
            onClick={triggerMapSearch}
            className="flex h-11 min-w-24 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[opacity] hover:bg-primary/90 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {isSearching ? t.auth.locationSearching : t.auth.locationSearchButton}
          </button>
        </div>
        {searchError && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-destructive">
            <AlertCircle className="size-3" />
            {t.auth.locationSearchNotFound}
          </p>
        )}
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border bg-card">
        <div ref={mapContainerRef} className="size-full" />

        {!isMapReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-surface-container-low/80 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t.auth.locationMapLoading}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute start-3 top-3 z-10">
          <div className="rounded-full border border-primary/20 bg-card/90 px-3.5 py-1.5 text-[0.68rem] font-bold text-primary shadow-lifted backdrop-blur-sm">
            {t.auth.locationClickHint}
          </div>
        </div>

        {autoCenterError && isMapReady && (
          <div className="absolute start-3 top-14 z-10">
            <div className="flex max-w-56 items-center gap-1.5 rounded-full border border-zest/40 bg-zest-soft px-3 py-1.5 text-[0.68rem] font-bold text-zest-soft-foreground shadow-lifted">
              <AlertCircle className="size-3 shrink-0" />
              {t.auth.locationAutoCenterError}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 end-3 z-10">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-[0.68rem] font-bold text-primary backdrop-blur-sm">
            <Target className="size-3.5" />
            <span dir="ltr">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
