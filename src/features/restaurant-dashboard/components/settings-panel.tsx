"use client";

import Image from "next/image";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Crown } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/shared/file-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getMyRestaurant } from "@/features/restaurant-dashboard/services";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function SettingsPanel() {
  const { t, lang } = useI18n();

  const { data: restaurant } = useQuery({
    queryKey: queryKeys.restaurants.detail("yasmeen-house"),
    queryFn: getMyRestaurant,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [primary, setPrimary] = useState("#850036");
  const [secondary, setSecondary] = useState("#fe9800");

  // Seed form fields when the query resolves or language changes (during render)
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = restaurant ? `${restaurant.id}-${lang}` : null;
  if (restaurant && seedKey !== seededFor) {
    setSeededFor(seedKey);
    setName(restaurant.name[lang]);
    setDescription(restaurant.description[lang]);
    setWhatsapp(restaurant.whatsapp);
    setPrimary(restaurant.theme.primaryColor);
    setSecondary(restaurant.theme.secondaryColor);
  }

  if (!restaurant) return <Skeleton className="h-96 rounded-2xl" />;

  const save = () => toast.success(t.common.done);

  return (
    <Tabs defaultValue="profile" className="gap-6">
      <TabsList className="h-auto w-fit flex-wrap rounded-xl p-1">
        <TabsTrigger value="profile" className="rounded-lg px-4 py-1.5 font-semibold">
          {t.dashboard.profileTab}
        </TabsTrigger>
        <TabsTrigger value="brand" className="rounded-lg px-4 py-1.5 font-semibold">
          {t.dashboard.brandTab}
        </TabsTrigger>
        <TabsTrigger value="theme" className="rounded-lg px-4 py-1.5 font-semibold">
          {t.dashboard.menuThemeTab}
        </TabsTrigger>
        <TabsTrigger value="plan" className="rounded-lg px-4 py-1.5 font-semibold">
          {t.dashboard.planTab}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <section className="max-w-2xl space-y-5 rounded-2xl border border-border/60 bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="s-name">{t.auth.restaurantNameLabel}</Label>
            <Input
              id="s-name"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-desc">{t.auth.descriptionLabel}</Label>
            <Textarea
              id="s-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-wa">{t.auth.whatsappLabel}</Label>
            <Input
              id="s-wa"
              dir="ltr"
              className="h-11"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <Button className="min-w-40" onClick={save}>
            {t.common.save}
          </Button>
        </section>
      </TabsContent>

      <TabsContent value="brand">
        <section className="max-w-2xl space-y-5 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-4">
            <Image
              src={restaurant.logoUrl}
              alt=""
              width={72}
              height={72}
              className="size-18 rounded-2xl border border-border object-cover"
            />
            <div className="flex-1">
              <FileDropzone label={t.auth.logoLabel} hint={t.auth.logoHint} />
            </div>
          </div>
          <Button className="min-w-40" onClick={save}>
            {t.common.save}
          </Button>
        </section>
      </TabsContent>

      <TabsContent value="theme">
        <section className="max-w-2xl space-y-6 rounded-2xl border border-border/60 bg-card p-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="s-primary">{t.auth.primaryColorLabel}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="s-primary"
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
                <span className="font-mono text-sm" dir="ltr">
                  {primary}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-secondary">{t.auth.secondaryColorLabel}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="s-secondary"
                  type="color"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
                <span className="font-mono text-sm" dir="ltr">
                  {secondary}
                </span>
              </div>
            </div>
          </div>

          {/* live preview strip */}
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div
              className="flex items-center justify-between px-5 py-4 text-white"
              style={{ backgroundColor: primary }}
            >
              <span className="font-heading font-bold">{name}</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: secondary, color: "#2c1600" }}
              >
                {t.menu.popular}
              </span>
            </div>
            <div className="flex items-center justify-between bg-background px-5 py-3.5">
              <span className="text-sm font-semibold">
                {t.auth.previewDishName}
              </span>
              <span className="text-sm font-bold" style={{ color: primary }} dir="ltr">
                45,000 {t.common.currency}
              </span>
            </div>
          </div>

          <Button className="min-w-40" onClick={save}>
            {t.common.save}
          </Button>
        </section>
      </TabsContent>

      <TabsContent value="plan">
        <section className="max-w-2xl rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-zest-soft text-zest-soft-foreground">
                <Crown className="size-6" />
              </span>
              <div>
                <p className="flex items-center gap-2 font-heading font-bold">
                  Premium
                  <Badge className="bg-success/10 text-success">
                    {t.common.active}
                  </Badge>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" />
                  {fmt(t.dashboard.planExpires, {
                    date: new Date(restaurant.planExpiresAt).toLocaleDateString(
                      lang === "ar" ? "ar-SY" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    ),
                  })}
                </p>
              </div>
            </div>
            <Button className="min-w-36">{t.dashboard.renewPlan}</Button>
          </div>
        </section>
      </TabsContent>
    </Tabs>
  );
}
