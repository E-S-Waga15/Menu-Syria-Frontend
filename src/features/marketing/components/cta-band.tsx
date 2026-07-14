import Link from "next/link";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function CtaBand({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#850036] via-[#9c0242] to-[#b0004a] px-6 py-16 text-center shadow-lifted md:px-16 md:py-20">
          {/* decorative plate rings */}
          <div
            aria-hidden
            className="absolute -top-24 -start-24 size-72 rounded-full border-[24px] border-white/5"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -end-20 size-96 rounded-full border-[32px] border-white/5"
          />

          <Sparkles className="mx-auto size-8 text-zest" aria-hidden />
          <h2 className="text-display mx-auto mt-5 max-w-2xl text-3xl text-white md:text-4xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80 md:text-lg">
            {t.home.ctaBody}
          </p>
          <Button
            className="mt-9 h-12 bg-white px-8 text-base font-bold text-[#850036] shadow-lifted hover:bg-white/90"
            render={<Link href={`/${lang}/register/restaurant`} />}
          >
            {t.home.ctaButton}
          </Button>
        </div>
      </div>
    </section>
  );
}
