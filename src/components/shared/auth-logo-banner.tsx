import Image from "next/image";

import logoMarkInverse from "@/assets/logo-mark-inverse.svg";

/**
 * The banner that sits at the top of the customer auth card — the berry
 * ground the brand mark sits on.
 *
 * Uses the inverse asset (white body + saffron bar baked in) rather than the
 * `currentColor` <LogoMark />, so the mark needs no recolouring to read on the
 * berry gradient — the same asset the inverted <Logo /> uses in dark headers.
 */
export function AuthLogoBanner({ brand }: { brand: string }) {
  return (
    <div className="relative flex h-45 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-t-3xl bg-gradient-to-br from-berry via-primary to-berry-bright text-white">
      {/* saffron aura — the only warm note on the berry ground */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -end-16 size-64 rounded-full bg-zest/25 blur-3xl"
      />

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
