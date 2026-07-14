import { Star } from "lucide-react";

import { fmt } from "@/i18n/fmt";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)} dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < Math.round(rating)
              ? "fill-zest text-zest"
              : "fill-surface-container-high text-surface-container-high",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsSection({
  reviews,
  lang,
  t,
}: {
  reviews: Review[];
  lang: Locale;
  t: Dictionary;
}) {
  if (reviews.length === 0) return null;

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <section className="border-t border-border/60 py-12">
      <h2 className="font-heading text-2xl font-bold">
        {t.restaurant.reviewsTitle}
      </h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* summary */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-end gap-3">
            <span className="text-display text-5xl text-primary">
              {average.toFixed(1)}
            </span>
            <div className="pb-1.5">
              <Stars rating={average} />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {fmt(t.restaurant.reviewsBasedOn, { count: reviews.length })}
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-2.5">
            {distribution.map(({ stars, count }) => (
              <li key={stars} className="flex items-center gap-3">
                <span className="flex w-8 items-center gap-1 text-xs font-bold">
                  {stars}
                  <Star className="size-3 fill-zest text-zest" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-end text-xs font-semibold text-muted-foreground">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* review cards */}
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-border/60 bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry-soft font-heading font-bold text-berry-soft-foreground">
                  {review.author.trim().charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{review.author}</p>
                  <p
                    className="mt-0.5 text-xs font-semibold text-muted-foreground"
                    dir="ltr"
                  >
                    {new Date(review.date).toLocaleDateString(
                      lang === "ar" ? "ar-SY" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                {review.comment[lang]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
