import Image from "next/image";

import logoMarkInverse from "@/assets/logo-mark-inverse.svg";
import { cn } from "@/lib/utils";

/**
 * The berry brand panel of a split auth card: a banner across the top on
 * small screens, a full-height side column from `lg` up — the parent decides
 * which by placing it in a grid that only becomes two columns at `lg`.
 *
 * Same gradient, aura and inverse mark as <AuthLogoBanner />, so the business
 * portal and the customer cards read as one system; this one just carries a
 * heading and an optional slot (the role picker) beside the mark.
 *
 * In RTL the panel lands on the right because it comes first in the grid —
 * no `order` juggling needed, the writing direction does it.
 */
export function AuthBrandPanel({
  brand,
  title,
  subtitle,
  children,
  className,
}: {
  brand: string;
  title: string;
  subtitle: string;
  /** optional block under the heading — e.g. the role picker */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-berry via-primary to-berry-bright px-6 py-9 text-center text-white lg:px-8 lg:py-12",
        className,
      )}
    >
      {/* saffron aura — the only warm note on the berry ground */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -end-16 size-64 rounded-full bg-zest/25 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-2.5">
        {/* decorative: the brand name is spelled out right below it */}
        <Image
          src={logoMarkInverse}
          alt=""
          className="h-14 w-auto object-contain lg:h-20"
          priority
        />
        <p className="font-heading text-xl font-bold lg:text-2xl">{brand}</p>
      </div>

      <div className="relative space-y-1.5">
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">{title}</h1>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>

      {children && <div className="relative w-full">{children}</div>}
    </div>
  );
}
