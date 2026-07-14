import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Wordmark: a berry rounded plate holding a fork glyph + bilingual brand name.
 */
export function Logo({
  lang,
  brand,
  className,
  inverted = false,
}: {
  lang: string;
  brand: string;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href={`/${lang}`}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={brand}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl shadow-soft",
          inverted ? "bg-white/10 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-5"
          aria-hidden
        >
          {/* fork */}
          <path d="M7 3v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
          <path d="M9 10v11" />
          {/* knife */}
          <path d="M16 3c-1.5 2.5-1.5 5.5 0 8v10" />
        </svg>
      </span>
      <span
        className={cn(
          "font-heading text-lg font-bold tracking-tight",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        {brand}
      </span>
    </Link>
  );
}
