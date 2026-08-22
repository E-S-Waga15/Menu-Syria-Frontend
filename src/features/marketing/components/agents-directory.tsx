"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { MapPin, MessageCircle, Phone, Search, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/client";
import type { Agent, Governorate, Region } from "@/lib/types";

const ALL = "all";

/**
 * Data arrives from the server (SSR — the directory is in the initial HTML);
 * search and filters run locally on the hydrated list.
 */
export function AgentsDirectory({
  agents,
  governorates,
  regions,
}: {
  agents: Agent[];
  governorates: Governorate[];
  regions: Region[];
}) {
  const { t, lang } = useI18n();

  const [search, setSearch] = useState("");
  const [governorateId, setGovernorateId] = useState(ALL);
  const [regionId, setRegionId] = useState(ALL);

  // regions narrow to the picked governorate
  const regionChoices = useMemo(
    () =>
      regions.filter(
        (r) => governorateId === ALL || r.governorateId === governorateId,
      ),
    [regions, governorateId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents.filter((agent) => {
      if (governorateId !== ALL && agent.governorateId !== governorateId)
        return false;
      if (regionId !== ALL && agent.regionId !== regionId) return false;
      if (
        q &&
        !agent.name.ar.toLowerCase().includes(q) &&
        !agent.name.en.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [agents, search, governorateId, regionId]);

  const governorateName = (id: string) =>
    governorates.find((g) => g.id === id)?.name[lang] ?? "";
  const regionName = (id: string) =>
    regions.find((r) => r.id === id)?.name[lang] ?? "";

  const governorateItems = {
    [ALL]: t.agentsPage.allGovernorates,
    ...Object.fromEntries(
      governorates.map((gov) => [gov.id, gov.name[lang]]),
    ),
  };
  const regionItems = {
    [ALL]: t.agentsPage.allRegions,
    ...Object.fromEntries(
      regionChoices.map((region) => [region.id, region.name[lang]]),
    ),
  };

  return (
    <div>
      {/* search + filters */}
      <div className="grid gap-3 md:grid-cols-[1fr_14rem_14rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.agentsPage.searchPlaceholder}
            className="h-11 rounded-full ps-10"
          />
        </div>

        <Select
          value={governorateId}
          onValueChange={(value) => {
            if (!value) return;
            setGovernorateId(value);
            setRegionId(ALL);
          }}
          items={governorateItems}
        >
          <SelectTrigger
            className="h-11 w-full rounded-full"
            aria-label={t.agentsPage.governorate}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(governorateItems).map(([id, label]) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={regionId}
          onValueChange={(value) => value && setRegionId(value)}
          items={regionItems}
        >
          <SelectTrigger
            className="h-11 w-full rounded-full"
            aria-label={t.agentsPage.region}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(regionItems).map(([id, label]) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* results */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-14 text-center text-muted-foreground">
            {t.agentsPage.noResults}
          </div>
        )}

        {filtered.map((agent) => (
          <article
            key={agent.id}
            className="group relative overflow-hidden rounded-2xl border border-border/60 transform-gpu bg-card p-5 transition-[translate,scale,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/35"
          >
            <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary to-zest" />

            <Link
              href={`/${lang}/agents/${agent.id}`}
              className="flex items-center gap-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Image
                src={agent.photoUrl}
                alt={agent.name[lang]}
                width={64}
                height={64}
                className="size-16 rounded-full border-2 border-berry-soft object-cover"
              />
              <div className="min-w-0">
                <h2 className="truncate font-heading font-semibold group-hover:text-primary">
                  {agent.name[lang]}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {governorateName(agent.governorateId)}
                    {lang === "ar" ? "، " : ", "}
                    {regionName(agent.regionId)}
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Store className="size-3.5 shrink-0" />
                  {agent.restaurantsCount} {t.home.agentRestaurantsCount}
                </p>
              </div>
            </Link>

            <div className="mt-5 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-[#414141] text-white hover:bg-[#2d2d2d] dark:bg-white/10 dark:hover:bg-white/20"
                render={<a href={`tel:${agent.phone.replace(/\s/g, "")}`} />}
              >
                <Phone className="size-3.5" />
                {t.home.agentCall}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-success/40 text-success hover:bg-success/10 hover:text-success"
                render={
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/[+\s]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <MessageCircle className="size-3.5" />
                {t.home.agentWhatsapp}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
