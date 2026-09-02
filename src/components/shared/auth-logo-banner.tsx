import Image from "next/image";

import logoMarkInverse from "@/assets/logo-mark-inverse.svg";

/**
 * The banner that sits at the top of the customer auth card — the berry
 * ground the brand mark sits on.
 *
 * The ground is <CtaBand />'s three pinned berry stops, so every branded
 * surface on the site matches; the band's plate rings are left out, since at
 * this banner's height they crowd the mark. Pinned rather than tokenised
 * because `--berry-bright` re-tones in dark mode, which would shift this
 * banner while the card under it stayed put.
 *
 * Uses the inverse asset (white body + saffron bar baked in) rather than the
 * `currentColor` <LogoMark />, so the mark needs no recolouring to read on the
 * berry ground — the same asset the inverted <Logo /> uses in dark headers.
 */
export function AuthLogoBanner({ brand }: { brand: string }) {
  return (
    <div className="relative flex h-45 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#850036] via-[#9c0242] to-[#b0004a] text-white">
      {/* decorative: the brand name is spelled out right below it */}
      <Image
        src={logoMarkInverse}
        alt=""
        className="relative h-25 w-auto object-contain"
        priority
      />
      <p className="relative font-heading text-2xl font-bold">{brand}</p>
    </div>
  );
}
