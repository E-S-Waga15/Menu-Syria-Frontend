"use client";

import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useI18n } from "@/i18n/client";

/**
 * Minimal top bar for the in-menu details page — deliberately has no site
 * navigation so QR visitors can only move between the menu and this page.
 */
export function BackToMenuBar({ menuHref }: { menuHref: string }) {
  const { t, dir } = useI18n();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center gap-2">
        <Link
          href={menuHref}
          className="flex items-center gap-2 rounded-full py-2 pe-4 text-sm font-bold text-primary transition-colors duration-200 hover:text-primary/80"
        >
          <BackArrow className="size-4.5" />
          {t.menu.backToMenu}
        </Link>
        <div className="ms-auto flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
