import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

import { CountUp } from "@/components/shared/count-up";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const stats = [
    { value: 500, suffix: "+", label: t.home.heroStatRestaurants },
    { value: 120, suffix: "K+", label: t.home.heroStatOrders },
    { value: 14, suffix: "", label: t.home.heroStatCities },
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="max-w-2xl">
          <span
            className="label-eyebrow inline-flex animate-fade-up items-center gap-2 rounded-full bg-zest-soft px-3.5 py-1.5 text-zest-soft-foreground"
            style={{ animationDelay: "0ms" }}
          >
            <span className="size-1.5 rounded-full bg-zest" aria-hidden />
            {t.home.heroEyebrow}
          </span>

          <h1
            className="text-display mt-6 animate-fade-up text-3xl leading-tight md:text-4xl xl:text-5xl"
            style={{ animationDelay: "90ms" }}
          >
            {t.home.heroTitle1}
            <br />
            <span className="text-primary">{t.home.heroTitle2}</span>
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "180ms" }}
          >
            {t.home.heroBody}
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-wrap items-center gap-3"
            style={{ animationDelay: "270ms" }}
          >
            <Button
              className="h-12 px-7 text-base"
              render={<Link href={`/${lang}/register/restaurant`} />}
            >
              {t.home.heroCtaPrimary}
              <Arrow className="size-4.5" />
            </Button>
            <Button
              variant="outline"
              className="h-12 border-[1.5px] border-primary/40 px-7 text-base font-semibold text-primary hover:bg-berry-soft/40 hover:text-primary"
              render={<Link href={`/${lang}/register/store`} />}
            >
              {t.home.heroCtaSecondary}
            </Button>
          </div>

          <dl
            className="mt-12 flex animate-fade-up flex-wrap gap-x-10 gap-y-4"
            style={{ animationDelay: "360ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-3xl font-bold text-foreground">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dd>
                <dd className="mt-0.5 text-sm text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual: a single restaurant scene with its menu orders overlaid */}
        <div
          className="relative mx-auto w-full max-w-lg animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="relative aspect-[4/5] overflow-hidden transform-gpu rounded-[2rem]">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* floating menu-order card */}
          <div className="absolute -start-6 bottom-14 flex w-56 items-center gap-3 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-lifted backdrop-blur-sm max-sm:-start-2">
            <Image
              src="https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=160&q=80"
              alt=""
              width={52}
              height={52}
              className="size-13 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {lang === "ar" ? "كنافة نابلسية" : "Nabulsi Knafeh"}
              </p>
              <p className="text-sm font-bold text-primary" dir="ltr">
                38,000 {t.common.currency}
              </p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <Plus className="size-4" />
            </span>
          </div>

          {/* floating live-order chip */}
          <div className="absolute -end-4 top-10 flex items-center gap-2.5 rounded-full border border-border/60 bg-card/95 py-2 ps-3 pe-4 shadow-lifted backdrop-blur-sm">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
            <p className="text-xs font-semibold">
              {lang === "ar" ? "طلب جديد — طاولة ٤" : "New order — table 4"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
