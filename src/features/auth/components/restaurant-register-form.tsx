"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { getGovernorates } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { cn } from "@/lib/utils";

const colorPresets: { primary: string; secondary: string }[] = [
  { primary: "#850036", secondary: "#fe9800" },
  { primary: "#0c4a6e", secondary: "#f59e0b" },
  { primary: "#14532d", secondary: "#eab308" },
  { primary: "#3f2212", secondary: "#c98747" },
  { primary: "#581c87", secondary: "#f472b6" },
  { primary: "#7a2810", secondary: "#e8a13c" },
];

interface FormData {
  name: string;
  cuisine: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  governorateId: string;
  address: string;
  lat: number | null;
  lng: number | null;
  whatsapp: string;
  instagram: string;
  facebook: string;
  referral: string;
}

export function RestaurantRegisterForm() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    cuisine: "",
    description: "",
    primaryColor: "#850036",
    secondaryColor: "#fe9800",
    governorateId: "",
    address: "",
    lat: null,
    lng: null,
    whatsapp: "",
    instagram: "",
    facebook: "",
    referral: "",
  });

  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const steps = [t.auth.step1, t.auth.step2, t.auth.step3, t.auth.step4];

  const canContinue =
    step === 0
      ? form.name.trim() !== ""
      : step === 2
        ? form.governorateId !== ""
        : step === 3
          ? form.whatsapp.trim() !== ""
          : true;

  const submit = () => {
    login({
      phone: form.whatsapp,
      role: "restaurant",
      name: form.name,
    });
    toast.success(t.auth.applicationSent);
    router.push(`/${lang}/dashboard`);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          {t.auth.restaurantRegTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {t.auth.restaurantRegBody}
        </p>
      </div>

      {/* step indicator */}
      <ol className="mx-auto mt-8 flex max-w-xl items-center">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn("flex items-center", i > 0 && "flex-1")}
          >
            {i > 0 && (
              <span
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full transition-colors duration-500",
                  i <= step ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <span className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground shadow-glow scale-110"
                      : "bg-surface-container text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-lifted md:p-10">
        {step === 0 && (
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="r-name">{t.auth.restaurantNameLabel} *</Label>
                <Input
                  id="r-name"
                  className="h-11"
                  placeholder={t.auth.restaurantNamePlaceholder}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-cuisine">{t.auth.restaurantTypeLabel}</Label>
                <Input
                  id="r-cuisine"
                  className="h-11"
                  value={form.cuisine}
                  onChange={(e) => set("cuisine", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-desc">{t.auth.descriptionLabel}</Label>
              <Textarea
                id="r-desc"
                rows={3}
                placeholder={t.auth.descriptionPlaceholder}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.logoLabel}</Label>
              <FileDropzone label={t.auth.logoLabel} hint={t.auth.logoHint} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,17rem)]">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>{t.auth.colorPresets}</Label>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((preset) => {
                    const isActive =
                      preset.primary === form.primaryColor &&
                      preset.secondary === form.secondaryColor;
                    return (
                      <button
                        key={preset.primary}
                        type="button"
                        onClick={() => {
                          set("primaryColor", preset.primary);
                          set("secondaryColor", preset.secondary);
                        }}
                        aria-pressed={isActive}
                        className={cn(
                          "relative size-12 transform-gpu overflow-hidden rounded-xl transition-transform duration-200 ease-smooth",
                          isActive
                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                            : "hover:scale-105",
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${preset.primary} 55%, ${preset.secondary} 55%)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="r-primary">{t.auth.primaryColorLabel}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="r-primary"
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                    />
                    <span className="font-mono text-sm" dir="ltr">
                      {form.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-secondary">
                    {t.auth.secondaryColorLabel}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="r-secondary"
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) => set("secondaryColor", e.target.value)}
                      className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                    />
                    <span className="font-mono text-sm" dir="ltr">
                      {form.secondaryColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* live preview dish card */}
            <div>
              <Label>{t.auth.livePreview}</Label>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lifted">
                <div
                  className="relative h-28"
                  style={{
                    background: `linear-gradient(135deg, ${form.primaryColor}, color-mix(in oklch, ${form.primaryColor}, black 20%))`,
                  }}
                >
                  <span
                    className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-bold"
                    style={{
                      backgroundColor: form.secondaryColor,
                      color: "#2c1600",
                    }}
                  >
                    {t.menu.popular}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-heading font-semibold">
                    {t.auth.previewDishName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.auth.previewDishDesc}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="text-sm font-bold"
                      style={{ color: form.primaryColor }}
                      dir="ltr"
                    >
                      45,000 {t.common.currency}
                    </span>
                    <span
                      className="flex size-8 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: form.primaryColor }}
                    >
                      <Plus className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.auth.governorateLabel} *</Label>
                <Select
                  value={form.governorateId || null}
                  onValueChange={(v) => v && set("governorateId", v)}
                  items={Object.fromEntries(
                    (governorates ?? []).map((g) => [g.id, g.name[lang]]),
                  )}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(governorates ?? []).map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-address">{t.auth.addressLabel}</Label>
                <Input
                  id="r-address"
                  className="h-11"
                  placeholder={t.auth.addressPlaceholder}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.auth.pickLocation}</Label>
              <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-14 w-full justify-start gap-3 border-dashed"
                    />
                  }
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      form.lat
                        ? "bg-success/10 text-success"
                        : "bg-berry-soft text-berry-soft-foreground",
                    )}
                  >
                    {form.lat ? (
                      <Check className="size-4.5" />
                    ) : (
                      <MapPin className="size-4.5" />
                    )}
                  </span>
                  <span className="text-start">
                    <span className="block text-sm font-semibold">
                      {form.lat ? t.auth.locationPicked : t.auth.openMapPicker}
                    </span>
                    {form.lat && (
                      <span
                        className="block text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {form.lat.toFixed(5)}, {form.lng?.toFixed(5)}
                      </span>
                    )}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t.auth.pickLocation}</DialogTitle>
                  </DialogHeader>
                  <MapPinPicker
                    onPick={(lat, lng) => {
                      set("lat", lat);
                      set("lng", lng);
                      setMapOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="r-wa">{t.auth.whatsappLabel} *</Label>
              <Input
                id="r-wa"
                dir="ltr"
                inputMode="tel"
                placeholder="+963 9XX XXX XXX"
                className="h-11"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-ig">{t.auth.instagramLabel}</Label>
              <Input
                id="r-ig"
                dir="ltr"
                placeholder="@yourrestaurant"
                className="h-11"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-fb">{t.auth.facebookLabel}</Label>
              <Input
                id="r-fb"
                dir="ltr"
                className="h-11"
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-ref">
                {t.auth.referralLabel}{" "}
                <span className="font-normal text-muted-foreground">
                  ({t.common.optional})
                </span>
              </Label>
              <Input
                id="r-ref"
                dir="ltr"
                placeholder={t.auth.referralPlaceholder}
                className="h-11"
                value={form.referral}
                onChange={(e) => set("referral", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="font-semibold"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            {t.common.back}
          </Button>
          {step < steps.length - 1 ? (
            <Button
              className="h-11 min-w-32 shadow-glow"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              {t.common.next}
            </Button>
          ) : (
            <Button
              className="h-11 min-w-40 shadow-glow"
              disabled={!canContinue}
              onClick={submit}
            >
              {t.auth.createAccount}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Stylised pin-drop surface — swaps for a real map SDK once keys exist. */
function MapPinPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="space-y-4 px-1 pb-1">
      <div
        className="relative h-72 cursor-crosshair overflow-hidden rounded-2xl border border-border bg-[linear-gradient(var(--surface-container)_1px,transparent_1px),linear-gradient(90deg,var(--surface-container)_1px,transparent_1px)] bg-surface-container-low"
        style={{ backgroundSize: "28px 28px" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPin({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        {/* faux roads */}
        <div className="absolute inset-x-0 top-1/3 h-3 -rotate-3 bg-surface-container-high/70" />
        <div className="absolute inset-y-0 start-1/4 w-2.5 rotate-6 bg-surface-container-high/70" />
        <div className="absolute inset-x-0 bottom-1/4 h-2 rotate-2 bg-surface-container-high/50" />

        {pin && (
          <MapPin
            className="absolute size-8 -translate-x-1/2 -translate-y-full fill-berry-soft text-primary"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          />
        )}
      </div>
      <Button
        className="w-full"
        disabled={!pin}
        onClick={() => {
          if (!pin) return;
          // project the canvas position onto a plausible bounding box around Damascus
          const lat = 33.58 - (pin.y / 100) * 0.14;
          const lng = 36.2 + (pin.x / 100) * 0.2;
          onPick(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        }}
      >
        <Check className="size-4" />
        <span className="font-semibold">OK</span>
      </Button>
    </div>
  );
}
