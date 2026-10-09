"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/**
 * The way out of every login and sign-up screen — an icon only, sitting in
 * the page's own header area rather than attached to the card, so it reads
 * as a control for the *screen* rather than a detail of the form underneath.
 *
 * Goes back to wherever the visitor actually came from, not always home: a
 * phone's own back gesture and this button should agree. `router.back()`
 * only works when there is somewhere in *this site's* history to return to
 * — a stray `history.length` past a direct link or an opened-in-a-new-tab
 * visit still has nowhere real to go, and sending that case `back()` leaves
 * the button doing nothing. The same-origin `document.referrer` check is
 * what tells the two apart; home is the fallback only when it fails.
 *
 * Colour is theme-aware rather than a token, because the two modes are not
 * variations on one idea here: light is a plain, barely-there outline —
 * paper on paper — while dark is glass, meant to pick up whatever sits
 * behind it rather than its own flat fill. No positioning of its own —
 * `(auth)/layout.tsx` places it in the header, once, for every page here.
 */
export function AuthBackButton({ className }: { className?: string }) {
  const { t, lang, dir } = useI18n();
  const router = useRouter();
  const Icon = dir === "rtl" ? ArrowRight : ArrowLeft;

  const goBack = () => {
    const cameFromThisSite =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;

    if (cameFromThisSite) router.back();
    else router.push(`/${lang}`);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t.common.goBack}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-200 hover:text-foreground",
        "dark:border-white/5 dark:bg-white/5 dark:backdrop-blur-md dark:hover:bg-white/10",
        className,
      )}
    >
      <Icon className="size-4.5" />
    </button>
  );
}
