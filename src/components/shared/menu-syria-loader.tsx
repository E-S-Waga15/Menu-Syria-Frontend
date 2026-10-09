"use client";

import Image from "next/image";

import { motion } from "motion/react";

import logoMark from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const sizes = {
  sm: 56,
  md: 96,
  lg: 140,
} as const;

/**
 * The site's own loader: the brand ring — not a generic spinner — turning
 * around the mark, with a light sweeping across the mark's own silhouette.
 *
 * This is for a wait the whole screen is doing (a route that has no
 * content-shaped skeleton to show instead, or a full-page transition), not
 * for a button or an inline check — those use `<Spinner />`. Reaching for
 * this everywhere it fits would turn the brand mark into wallpaper; it earns
 * its place by standing for "the page itself", once per screen.
 *
 * The ring is driven by Motion's own rAF loop rather than a CSS animation
 * class, so it keeps turning smoothly however the surrounding layout reflows
 * — a CSS `animate-spin` restarts if the element is ever unmounted and
 * remounted by a layout shift; this one doesn't care.
 */
export function MenuSyriaLoader({
  size = "md",
  fullScreen = false,
  label,
  className,
}: {
  size?: keyof typeof sizes | number;
  /** covers the viewport on its own tonal ground, for a wait nothing else frames */
  fullScreen?: boolean;
  /** announced to a screen reader; omit beside text that already says it */
  label?: string;
  className?: string;
}) {
  const px = typeof size === "number" ? size : sizes[size];
  const markSrc = typeof logoMark === "string" ? logoMark : logoMark.src;

  const mark = (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full border-4 border-primary/15 border-t-primary border-s-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="relative overflow-hidden"
        style={{ width: px * 0.6, height: px * 0.6 }}
      >
        <Image
          src={logoMark}
          alt=""
          fill
          priority
          className="object-contain"
        />

        {/* the shine, masked to the mark's own silhouette so it sweeps across
            the artwork rather than across a rectangle around it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage: `url(${markSrc})`,
            maskImage: `url(${markSrc})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        >
          <motion.div
            className="absolute inset-y-0 w-1/2"
            style={{
              background:
                "linear-gradient(115deg, transparent, rgba(255,255,255,0.7), transparent)",
            }}
            initial={{ x: "-200%" }}
            animate={{ x: "130%" }}
            transition={{
              duration: 0.95,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.01,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {label && (
        <span role="status" className="sr-only">
          {label}
        </span>
      )}
    </div>
  );

  if (!fullScreen) return mark;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background">
      {mark}
    </div>
  );
}
