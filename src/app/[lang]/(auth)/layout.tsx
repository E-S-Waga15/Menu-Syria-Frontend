import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-background to-surface-container-low">
      {/* subtle berry aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-berry-bright/8 blur-3xl"
      />

      <header className="container-page flex h-16 items-center justify-between">
        <Logo lang={lang} brand={t.common.brand} />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="pb-8 text-center">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowRight className="size-4 rtl:rotate-180" />
          {t.common.backHome}
        </Link>
      </footer>
    </div>
  );
}
