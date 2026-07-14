"use client";

import { usePathname, useRouter } from "next/navigation";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const target: Locale = lang === "ar" ? "en" : "ar";

  const switchLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = target;
    // replace, not push: switching language shouldn't add a history entry —
    // this also keeps QR menu visitors from gaining an in-site back stop
    router.replace(segments.join("/") || `/${target}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={switchLanguage}
      aria-label={t.common.language}
    >
      <Languages className="size-4" />
      <span className="font-semibold">{target === "ar" ? "عربي" : "EN"}</span>
    </Button>
  );
}
