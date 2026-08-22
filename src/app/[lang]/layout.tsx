import type { Metadata } from "next";
import { Cairo, Epilogue, Geist_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";

import { DirectionProvider } from "@base-ui/react/direction-provider";

import { I18nProvider } from "@/i18n/client";
import { isLocale, localeDirections, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor, SITE_URL } from "@/lib/seo/site";
import { AppProviders } from "@/providers/app-providers";

import "../globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t.seo.homeTitle,
      template: `%s | ${t.seo.siteName}`,
    },
    description: t.seo.homeDescription,
    keywords: t.seo.keywords,
    alternates: alternatesFor(lang, ""),
    openGraph: {
      type: "website",
      siteName: t.seo.siteName,
      locale: lang === "ar" ? "ar_SY" : "en_US",
      title: t.seo.homeTitle,
      description: t.seo.homeDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: t.seo.homeTitle,
      description: t.seo.homeDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dir = localeDirections[lang];
  const dictionary = await getDictionary(lang);

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${epilogue.variable} ${manrope.variable} ${cairo.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject
          attributes into <body> before React hydrates — harmless, so ignore */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <DirectionProvider direction={dir}>
          <I18nProvider lang={lang} dictionary={dictionary}>
            <AppProviders>{children}</AppProviders>
          </I18nProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
