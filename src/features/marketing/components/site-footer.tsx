import Link from "next/link";

import { Mail, Phone } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/shared/brand-icons";
import { Logo } from "@/components/shared/logo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SiteFooter({ lang, t }: { lang: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: `/${lang}#services`, label: t.nav.services },
    { href: `/${lang}#restaurants`, label: t.nav.restaurants },
    { href: `/${lang}#agents`, label: t.nav.agents },
    { href: `/${lang}/register/restaurant`, label: t.nav.createStore },
  ];

  return (
    <footer className="bg-[#141617] text-white/80 dark:bg-surface-dim">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo lang={lang} brand={t.common.brand} inverted />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {t.footer.about}
          </p>
        </div>

        <nav aria-label={t.footer.linksTitle}>
          <h3 className="label-eyebrow mb-4 text-zest">
            {t.footer.linksTitle}
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.footer.legalTitle}>
          <h3 className="label-eyebrow mb-4 text-zest">
            {t.footer.legalTitle}
          </h3>
          <ul className="space-y-2.5">
            <li>
              <Link
                href={`/${lang}/privacy`}
                className="text-sm transition-colors hover:text-white"
              >
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link
                href={`/${lang}/terms`}
                className="text-sm transition-colors hover:text-white"
              >
                {t.footer.terms}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="label-eyebrow mb-4 text-zest">
            {t.footer.contactTitle}
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-white/40" />
              <span dir="ltr">+963 11 000 0000</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-white/40" />
              <span dir="ltr">hello@menusyria.com</span>
            </li>
          </ul>
          <div className="mt-5 flex gap-2">
            {[
              { icon: InstagramIcon, label: "Instagram" },
              { icon: FacebookIcon, label: "Facebook" },
              { icon: WhatsAppIcon, label: "WhatsApp" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg bg-white/5 transition-colors hover:bg-primary hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {t.common.brand} — {t.footer.rights}
          </p>
          <p>{t.footer.madeIn} 🤍</p>
        </div>
      </div>
    </footer>
  );
}
