import Image from "next/image";

import logoMarkInverse from "@/assets/logo-mark-inverse.svg";
import { cn } from "@/lib/utils";

/**
 * The berry brand panel of a split auth card: a banner across the top on
 * small screens, a full-height side column from `lg` up — the parent decides
 * which by placing it in a grid that only becomes two columns at `lg`.
 *
 * The ground is lifted from <CtaBand /> — the same three pinned berry stops —
 * so the panel behind the mark and the card that closes the home and About
 * pages are visibly one thing. The band's plate rings are deliberately left
 * out here: at this panel's size they crowd the mark rather than frame it.
 *
 * Pinned literals rather than tokens, exactly as the band does it:
 * `--berry-bright` re-tones to a hot #e0446f in dark, which would shift this
 * panel between themes while the card beside it stayed put.
 *
 * Same ground and inverse mark as <AuthLogoBanner />, so the business portal
 * and the customer cards read as one system; this one just carries a heading
 * and an optional slot (the role picker) beside the mark.
 *
 * In RTL the panel lands on the right because it comes first in the grid —
 * no `order` juggling needed, the writing direction does it.
 */
export function AuthBrandPanel({
  brand,
  title,
  subtitle,
  children,
  compactText = false,
  className,
}: {
  brand: string;
  title: string;
  subtitle: string;
  /** optional block under the heading — e.g. the role picker */
  children?: React.ReactNode;
  /**
   * Sets the heading and subtitle a step down. The console's panel carries no
   * role picker under it, so its text would otherwise sit larger than the
   * business portal's while saying less.
   */
  compactText?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-[#850036] via-[#9c0242] to-[#b0004a] px-6 py-9 text-center text-white lg:px-8 lg:py-12",
        className,
      )}
    >
      <div className="relative flex flex-col items-center gap-2.5">
        {/* decorative: the brand name is spelled out right below it */}
        <Image
          src={logoMarkInverse}
          alt=""
          className="h-25 w-auto object-contain"
          priority
        />
        <p className="font-heading text-2xl font-bold lg:text-3xl">{brand}</p>
      </div>

      <div className="relative space-y-1.5">
        <h1
          className={cn(
            "font-heading font-bold",
            compactText ? "text-lg lg:text-xl" : "text-2xl lg:text-3xl",
          )}
        >
          {title}
        </h1>
        <p className={cn("text-white/80", compactText ? "text-xs" : "text-sm")}>
          {subtitle}
        </p>
      </div>

      {children && <div className="relative w-full">{children}</div>}
    </div>
  );
}
