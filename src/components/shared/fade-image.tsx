"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A `next/image` that admits it hasn't arrived yet.
 *
 * `next/image` already lazy-loads and reserves the right box (via `fill` or
 * width/height), which is most of what a hand-rolled "blur-up" setup exists
 * to provide. The one thing it does not do on its own is show *something*
 * while the bytes are in flight — without this, a slow photograph is a blank
 * hole in the card until it suddenly pops in. This keeps a skeleton under the
 * image and fades the photograph in over it once `onLoad` fires, so the
 * swap reads as the picture arriving rather than the layout flinching.
 *
 * Callers keep their own `onError`/fallback branch — this only ever renders
 * once a `src` exists, same as before.
 */
export function FadeImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <Skeleton aria-hidden className="absolute inset-0 rounded-none" />
      )}
      {/* alt is required by ImageProps and always forwarded via ...props;
          the rule can't see through the spread */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          "transition-opacity duration-300 ease-smooth",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
