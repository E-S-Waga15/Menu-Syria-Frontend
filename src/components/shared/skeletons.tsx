import { Skeleton } from "@/components/ui/skeleton";

/**
 * The placeholder shapes the route-level `loading.tsx` files are built from.
 *
 * Each one mirrors the real thing it stands in for, down to the aspect ratio
 * of the cover and the height of the caption. A placeholder the wrong size
 * moves the page when the content lands, which reads as slower than showing
 * nothing — the reader has to find their place again. Matching shapes make
 * the swap invisible.
 */

/** mirrors <RestaurantCard />: an 8/3 cover over a two-line caption */
export function StorefrontCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Skeleton className="aspect-[8/3] rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** mirrors <OfferCard />: one 16/9 photograph, words laid over it */
export function OfferCardSkeleton() {
  return <Skeleton className="aspect-[16/9] rounded-2xl" />;
}

/** mirrors <DishCard />: a 4/3 cover over a name and a price row */
export function DishCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3.5 pb-4">
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-3 flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** the eyebrow, display title and supporting line every section opens with */
export function SectionHeadSkeleton() {
  return (
    <div className="max-w-2xl space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-64 md:h-10" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

/**
 * A grid of identical cards. `count` is deliberately small — a placeholder is
 * a promise about what is coming, and promising twelve cards when four arrive
 * is its own kind of jolt.
 */
export function CardGridSkeleton({
  count = 6,
  variant = "storefront",
}: {
  count?: number;
  variant?: "storefront" | "offer" | "dish";
}) {
  const Card =
    variant === "offer"
      ? OfferCardSkeleton
      : variant === "dish"
        ? DishCardSkeleton
        : StorefrontCardSkeleton;

  const columns =
    variant === "dish"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-5 md:gap-6 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

/** a console or dashboard panel: a titled card with rows inside it */
export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <div className="border-b border-border/60 px-5 py-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-5 py-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** the four figures a dashboard opens with */
export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}
