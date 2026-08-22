"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, lang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${lang}#services`, label: t.nav.services },
    { href: `/${lang}/restaurants`, label: t.nav.restaurants },
    { href: `/${lang}/stores`, label: t.nav.stores },
    { href: `/${lang}/agents`, label: t.nav.agents },
    { href: `/${lang}#team`, label: t.nav.team },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-border/70 bg-background/80 shadow-soft backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo lang={lang} brand={t.common.brand} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Button
            variant="ghost"
            className="hidden font-semibold md:inline-flex"
            render={<Link href={`/${lang}/login`} />}
          >
            {t.nav.login}
          </Button>
          <Button
            className="hidden shadow-glow md:inline-flex"
            render={<Link href={`/${lang}#sectors`} />}
          >
            {t.nav.createStore}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side={lang === "ar" ? "left" : "right"}>
              <SheetHeader>
                <SheetTitle>{t.common.brand}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-semibold transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    render={<Link href={`/${lang}/login`} />}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.login}
                  </Button>
                  <Button
                    render={<Link href={`/${lang}#sectors`} />}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.createStore}
                  </Button>
                  <LanguageSwitcher className="self-center" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
