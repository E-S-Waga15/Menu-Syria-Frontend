"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { MessageCircle, Phone, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/client";
import type { Agent, Governorate } from "@/lib/types";

/**
 * Data arrives from the server (SSR — agents are in the initial HTML);
 * this component only handles the governorate filter interaction.
 */
export function AgentsSection({
  agents,
  governorates,
}: {
  agents: Agent[];
  governorates: Governorate[];
}) {
  const { t, lang } = useI18n();
  const [governorateId, setGovernorateId] = useState("damascus");

  const filtered = agents.filter((a) => a.governorateId === governorateId);

  return (
    <section id="agents" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div>
          <p className="label-eyebrow text-primary">{t.home.agentsEyebrow}</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            {t.home.agentsTitle}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.home.agentsBody}</p>

          <label className="mt-8 block text-sm font-semibold">
            {t.home.agentsSelectLabel}
          </label>
          <Select
            value={governorateId}
            onValueChange={(value) => value && setGovernorateId(value)}
            items={Object.fromEntries(
              governorates.map((gov) => [gov.id, gov.name[lang]]),
            )}
          >
            <SelectTrigger className="mt-2 h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {governorates.map((gov) => (
                <SelectItem key={gov.id} value={gov.id}>
                  {gov.name[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid content-start gap-5 sm:grid-cols-2">
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              {t.common.comingSoon}
            </div>
          )}

          {filtered.map((agent) => (
            <article
              key={agent.id}
              className="group relative transform-gpu overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-[translate,scale,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/35"
            >
              {/* business-card accent stripe */}
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
                <div>
                  <h3 className="font-heading font-semibold group-hover:text-primary">
                    {agent.name[lang]}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Store className="size-3.5" />
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
    </section>
  );
}
