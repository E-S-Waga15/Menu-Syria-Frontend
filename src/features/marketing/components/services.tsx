import {
  ChartNoAxesCombined,
  LayoutGrid,
  MessageCircle,
  QrCode,
} from "lucide-react";

import type { Dictionary } from "@/i18n/get-dictionary";

export function Services({ t }: { t: Dictionary }) {
  const services = [
    { icon: QrCode, title: t.home.service1Title, body: t.home.service1Body },
    {
      icon: MessageCircle,
      title: t.home.service2Title,
      body: t.home.service2Body,
    },
    {
      icon: LayoutGrid,
      title: t.home.service3Title,
      body: t.home.service3Body,
    },
    {
      icon: ChartNoAxesCombined,
      title: t.home.service4Title,
      body: t.home.service4Body,
    },
  ];

  return (
    <section id="services" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-eyebrow text-primary">
            {t.home.servicesEyebrow}
          </p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            {t.home.servicesTitle}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {t.home.servicesBody}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="group rounded-2xl border border-border/60 transform-gpu bg-card p-6 transition-[translate,scale,border-color] duration-300 ease-smooth hover:-translate-y-1.5 hover:border-primary/35"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-berry-soft text-berry-soft-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <service.icon className="size-6" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">
                {service.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {service.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
