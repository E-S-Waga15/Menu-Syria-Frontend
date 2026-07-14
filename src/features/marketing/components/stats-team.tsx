import Image from "next/image";

import { CountUp } from "@/components/shared/count-up";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { TeamMember } from "@/lib/types";

export function StatsTeam({
  lang,
  t,
  team,
}: {
  lang: Locale;
  t: Dictionary;
  team: TeamMember[];
}) {
  const stats = [
    { value: 640, suffix: "+", label: t.home.statMenus },
    { value: 95, suffix: "K", label: t.home.statScans },
    { value: 40, suffix: "+", label: t.home.statAgents },
    { value: 98, suffix: "%", label: t.home.statSatisfaction },
  ];

  return (
    <section id="team" className="scroll-mt-20 bg-surface-container-low py-16 md:py-24">
      <div className="container-page">
        <div className="text-center">
          <p className="label-eyebrow text-primary">{t.home.statsEyebrow}</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            {t.home.statsTitle}
          </h2>
        </div>

        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-display text-4xl text-primary md:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-20 text-center">
          <p className="label-eyebrow text-primary">{t.home.teamEyebrow}</p>
          <h2 className="text-display mt-3 text-2xl md:text-3xl">
            {t.home.teamTitle}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {team.map((member) => (
            <article
              key={member.id}
              className="group overflow-hidden rounded-2xl border border-border/60 transform-gpu bg-card transition-[translate,scale,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-primary/35"
            >
              <div className="relative aspect-[4/4.6] overflow-hidden bg-surface-container">
                <Image
                  src={member.photoUrl}
                  alt={member.name[lang]}
                  fill
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  className="transform-gpu object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-heading font-semibold">
                  {member.name[lang]}
                </h3>
                <p className="label-eyebrow mt-1.5 text-[0.68rem] text-muted-foreground">
                  {member.role[lang]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
