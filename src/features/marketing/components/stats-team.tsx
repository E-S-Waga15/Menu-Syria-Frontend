import { CountUp } from "@/components/shared/count-up";
import type { Dictionary } from "@/i18n/get-dictionary";

export function StatsTeam({ t }: { t: Dictionary }) {
  const stats = [
    { value: 640, suffix: "+", label: t.home.statMenus },
    { value: 95, suffix: "K", label: t.home.statScans },
    { value: 40, suffix: "+", label: t.home.statAgents },
    { value: 98, suffix: "%", label: t.home.statSatisfaction },
  ];

  return (
    <section
      id="stats"
      className="scroll-mt-20 bg-surface-container-low py-16 md:py-24"
    >
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
      </div>
    </section>
  );
}
