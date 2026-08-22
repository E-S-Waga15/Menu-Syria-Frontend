import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentsDirectory } from "@/features/marketing/components/agents-directory";
import {
  getAgents,
  getGovernorates,
  getRegions,
} from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { alternatesFor } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.seo.agentsTitle,
    description: t.seo.agentsDescription,
    alternates: alternatesFor(lang, "/agents"),
  };
}

export default async function AgentsPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // fetched on the server — the directory ships as crawlable HTML
  const [t, agents, governorates, regions] = await Promise.all([
    getDictionary(lang),
    getAgents(),
    getGovernorates(),
    getRegions(),
  ]);

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      <div className="max-w-2xl">
        <p className="label-eyebrow text-primary">{t.home.agentsEyebrow}</p>
        <h1 className="text-display mt-3 text-3xl md:text-4xl">
          {t.agentsPage.title}
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {t.agentsPage.subtitle}
        </p>
      </div>

      <div className="mt-10">
        <AgentsDirectory
          agents={agents}
          governorates={governorates}
          regions={regions}
        />
      </div>
    </main>
  );
}
