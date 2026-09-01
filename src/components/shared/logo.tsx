import Image from "next/image";
import Link from "next/link";

import logoMark from "@/assets/logo.png";
import logoMarkInverse from "@/assets/logo-mark-inverse.svg";
import logoWord from "@/assets/logo_word.png";
import logoWordWhite from "@/assets/logo_word_white.png";
import { cn } from "@/lib/utils";

/**
 * Brand mark (`src/assets/logo.png`) + the drawn wordmark.
 *
 * The wordmark is artwork, not type — `logo_word.png` on light grounds and
 * `logo_word_white.png` on dark ones, since the berry lettering would vanish
 * against the footer.
 *
 * Both wordmarks are 560×60, so height drives a ~9.3× wider box: every 1px of
 * height costs 9px of row. That makes the lockup the widest thing in the
 * mobile header (which also holds the menu trigger, theme toggle and login
 * button), so mark, gap and wordmark all step up together — 28+131px on a
 * phone, 36+168px from `lg`.
 *
 * `alt=""` on both images: the wrapping link already carries `aria-label`,
 * so the brand name is announced once, not twice.
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
      className={cn("flex items-center gap-2 sm:gap-2.5", className)}
      aria-label={brand}
    >
      <Image
        src={inverted ? logoMarkInverse : logoMark}
        alt=""
        className="size-7 object-contain sm:size-8 lg:size-9"
        priority
      />
      <Image
        src={inverted ? logoWordWhite : logoWord}
        alt=""
        className="h-3 w-auto object-contain sm:h-3 lg:h-3"
        priority
      />
    </Link>
  );
}
