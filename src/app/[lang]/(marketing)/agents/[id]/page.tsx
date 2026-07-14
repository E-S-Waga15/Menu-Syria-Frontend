import Image from "next/image";
import { notFound } from "next/navigation";

import { BadgeCheck, MapPin, Phone, Store } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/shared/brand-icons";
import { AgentRestaurants } from "@/features/marketing/components/agent-restaurants";
import {
  getAgentById,
  getGovernorates,
  getRegions,
} from "@/features/marketing/services";
import { isLocale } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AgentDetailsPage({
  params,
}: PageProps<"/[lang]/agents/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const [t, agent, governorates, regions] = await Promise.all([
    getDictionary(lang),
    getAgentById(id),
    getGovernorates(),
    getRegions(),
  ]);
  if (!agent) notFound();

  const governorateName =
    governorates.find((g) => g.id === agent.governorateId)?.name[lang] ?? "";
  const regionName =
    regions.find((r) => r.id === agent.regionId)?.name[lang] ?? "";

  const socials = [
    {
      label: t.restaurant.call,
      icon: Phone,
      href: `tel:${agent.phone.replace(/\s/g, "")}`,
      className: "bg-muted text-foreground hover:bg-surface-container-high",
    },
    {
      label: t.restaurant.whatsapp,
      icon: WhatsAppIcon,
      href: `https://wa.me/${agent.whatsapp.replace(/[+\s]/g, "")}`,
      className:
        "bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20 dark:text-[#4cd97f]",
    },
    agent.facebook && {
      label: t.restaurant.facebook,
      icon: FacebookIcon,
      href: `https://facebook.com/${agent.facebook}`,
      className:
        "bg-[#1877F2]/10 text-[#1462c4] hover:bg-[#1877F2]/20 dark:text-[#6ba8f5]",
    },
    agent.instagram && {
      label: t.restaurant.instagram,
      icon: InstagramIcon,
      href: `https://instagram.com/${agent.instagram}`,
      className:
        "bg-gradient-to-r from-[#f9ce34]/15 via-[#ee2a7b]/15 to-[#6228d7]/15 text-[#c13584] hover:from-[#f9ce34]/25 hover:via-[#ee2a7b]/25 hover:to-[#6228d7]/25 dark:text-[#ef7cae]",
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    className: string;
  }[];

  return (
    <main className="container-page pt-28 pb-20 md:pt-32">
      {/* identity */}
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
        <div className="relative mx-auto md:mx-0">
          <Image
            src={agent.photoUrl}
            alt={agent.name[lang]}
            width={224}
            height={224}
            priority
            className="size-44 rounded-3xl border-4 border-berry-soft object-cover md:size-56"
          />
          {/* accent corner echoing the agent-card stripe */}
          <span className="absolute -bottom-2 -end-2 flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-zest text-white">
            <BadgeCheck className="size-5" />
          </span>
        </div>

        <div className="text-center md:text-start">
          <p className="label-eyebrow text-primary">
            {fmt(t.agentPage.roleIn, {
              governorate: governorateName,
              region: regionName,
            })}
          </p>
          <h1 className="text-display mt-2 text-3xl md:text-4xl">
            {agent.name[lang]}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground md:justify-start">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {governorateName}
              {lang === "ar" ? "، " : ", "}
              {regionName}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Store className="size-4 text-primary" />
              {agent.restaurantsCount} {t.home.agentRestaurantsCount}
            </span>
          </div>

          <div className="mt-5 max-w-2xl">
            <h2 className="label-eyebrow text-muted-foreground">
              {t.agentPage.about}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {agent.bio[lang]}
            </p>
          </div>

          {/* contact */}
          <div className="mt-6 space-y-4">
            <p className="flex items-center justify-center gap-2.5 text-base font-semibold md:justify-start">
              <span className="flex size-9 items-center justify-center rounded-full bg-berry-soft text-berry-soft-foreground">
                <Phone className="size-4" />
              </span>
              <span dir="ltr">{agent.phone}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${social.className}`}
                >
                  <social.icon className="size-4" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AgentRestaurants
        agentId={agent.id}
        restaurantsCount={agent.restaurantsCount}
      />
    </main>
  );
}
