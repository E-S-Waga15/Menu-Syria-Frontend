import { notFound } from "next/navigation";

import { SiteFooter } from "@/features/marketing/components/site-footer";
import { SiteHeader } from "@/features/marketing/components/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter lang={lang} t={t} />
    </>
  );
}
