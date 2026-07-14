import type { Metadata } from "next";
import { Cairo, Epilogue, Geist_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";

import { DirectionProvider } from "@base-ui/react/direction-provider";

import { I18nProvider } from "@/i18n/client";
import { isLocale, localeDirections, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
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
  const isAr = lang === "ar";
  return {
    title: {
      default: isAr ? "منيو سوريا — المنصة الفاخرة للمنيو الرقمي" : "Menu Syria — The Luxury Digital Menu Platform",
      template: isAr ? "%s | منيو سوريا" : "%s | Menu Syria",
    },
    description: isAr
      ? "حوّل قائمة طعامك إلى تجربة رقمية ساحرة بألوان هويتك، مع طلبات تصل واتسابك مباشرة."
      : "Turn your menu into a captivating digital experience in your brand colors, with orders landing straight in your WhatsApp.",
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
