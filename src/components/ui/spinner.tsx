"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const sizes = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

const tones = {
  /** the brand mark — the default, and what a page-level wait uses */
  primary: "text-primary",
  /** inherits whatever colour the text around it is, for buttons and chips */
  current: "text-current",
  /** a background check nobody is waiting on */
  muted: "text-muted-foreground",
} as const;

/**
 * The one spinner.
 *
 * Every wait in the product should look like the same wait, so the size steps
 * and the colours live here rather than as a hand-written `animate-spin` at
 * each call site.
 *
 * `tone` is the whole reason it takes props: a spinner on a page belongs to
 * the brand, while one inside a button belongs to that button's label, which
 * is already the right colour on every variant — so `current` is all a button
 * ever needs, whatever its background.
 */
export function Spinner({
  size = "sm",
  tone = "primary",
  className,
  label,
}: {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
  /**
   * What a screen reader should announce. Omit it when the spinner sits
   * beside text that already says it — two announcements is worse than none.
   */
  label?: string;
}) {
  return (
    <>
      <motion.span
        aria-hidden
        className={cn(
          "rounded-full border-2 border-current/25 border-t-current",
          sizes[size],
          tones[tone],
          className,
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      {label && (
        <span role="status" className="sr-only">
          {label}
        </span>
      )}
    </>
  );
}
