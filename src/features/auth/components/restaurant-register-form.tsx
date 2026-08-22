"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/shared/field-error";
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
import {
  registerWizardSchema,
  type RegisterWizardValues,
} from "@/features/auth/schemas";
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

/** which schema fields each wizard step must pass before advancing */
const stepFields: (keyof RegisterWizardValues)[][] = [
  ["name"],
  ["primaryColor", "secondaryColor"],
  ["governorateId"],
  ["whatsapp"],
];

export interface RegisterCopy {
  title: string;
  body: string;
  nameLabel: string;
  namePlaceholder: string;
  typeLabel: string;
}

export function RestaurantRegisterForm({
  copy,
}: {
  /** overrides for the store variant; defaults to restaurant wording */
  copy?: RegisterCopy;
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterWizardValues>({
    resolver: zodResolver(registerWizardSchema(t.validation)),
    defaultValues: {
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
    },
    mode: "onTouched",
  });

  const [primaryColor, secondaryColor, lat, lng] = useWatch({
    control,
    name: ["primaryColor", "secondaryColor", "lat", "lng"],
  });

  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  const steps = [t.auth.step1, t.auth.step2, t.auth.step3, t.auth.step4];

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const submit = (values: RegisterWizardValues) => {
    login({
      identifier: values.whatsapp,
      role: "owner",
      name: values.name,
    });
    toast.success(t.auth.applicationSent);
    router.push(`/${lang}/dashboard`);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          {copy?.title ?? t.auth.restaurantRegTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {copy?.body ?? t.auth.restaurantRegBody}
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

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-lifted md:p-10"
      >
        {step === 0 && (
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="r-name">
                  {copy?.nameLabel ?? t.auth.restaurantNameLabel} *
                </Label>
                <Input
                  id="r-name"
                  className="h-11"
                  placeholder={
                    copy?.namePlaceholder ?? t.auth.restaurantNamePlaceholder
                  }
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-cuisine">
                  {copy?.typeLabel ?? t.auth.restaurantTypeLabel}
                </Label>
                <Input id="r-cuisine" className="h-11" {...register("cuisine")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-desc">{t.auth.descriptionLabel}</Label>
              <Textarea
                id="r-desc"
                rows={3}
                placeholder={t.auth.descriptionPlaceholder}
                {...register("description")}
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
                      preset.primary === primaryColor &&
                      preset.secondary === secondaryColor;
                    return (
                      <button
                        key={preset.primary}
                        type="button"
                        onClick={() => {
                          setValue("primaryColor", preset.primary);
                          setValue("secondaryColor", preset.secondary);
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
                      value={primaryColor}
                      onChange={(e) => setValue("primaryColor", e.target.value)}
                      className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                    />
                    <span className="font-mono text-sm" dir="ltr">
                      {primaryColor}
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
                      value={secondaryColor}
                      onChange={(e) =>
                        setValue("secondaryColor", e.target.value)
                      }
                      className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                    />
                    <span className="font-mono text-sm" dir="ltr">
                      {secondaryColor}
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
                    background: `linear-gradient(135deg, ${primaryColor}, color-mix(in oklch, ${primaryColor}, black 20%))`,
                  }}
                >
                  <span
                    className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-bold"
                    style={{
                      backgroundColor: secondaryColor,
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
                      style={{ color: primaryColor }}
                      dir="ltr"
                    >
                      45,000 {t.common.currency}
                    </span>
                    <span
                      className="flex size-8 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: primaryColor }}
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
                <Controller
                  control={control}
                  name="governorateId"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(v) => v && field.onChange(v)}
                      items={Object.fromEntries(
                        (governorates ?? []).map((g) => [g.id, g.name[lang]]),
                      )}
                    >
                      <SelectTrigger
                        className="h-11 w-full"
                        aria-invalid={!!errors.governorateId}
                      >
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
                  )}
                />
                <FieldError message={errors.governorateId?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-address">{t.auth.addressLabel}</Label>
                <Input
                  id="r-address"
                  className="h-11"
                  placeholder={t.auth.addressPlaceholder}
                  {...register("address")}
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
                      lat
                        ? "bg-success/10 text-success"
                        : "bg-berry-soft text-berry-soft-foreground",
                    )}
                  >
                    {lat ? (
                      <Check className="size-4.5" />
                    ) : (
                      <MapPin className="size-4.5" />
                    )}
                  </span>
                  <span className="text-start">
                    <span className="block text-sm font-semibold">
                      {lat ? t.auth.locationPicked : t.auth.openMapPicker}
                    </span>
                    {lat && (
                      <span
                        className="block text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {lat.toFixed(5)}, {lng?.toFixed(5)}
                      </span>
                    )}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t.auth.pickLocation}</DialogTitle>
                  </DialogHeader>
                  <MapPinPicker
                    onPick={(pickedLat, pickedLng) => {
                      setValue("lat", pickedLat);
                      setValue("lng", pickedLng);
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
                aria-invalid={!!errors.whatsapp}
                className="h-11"
                {...register("whatsapp")}
              />
              <FieldError message={errors.whatsapp?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-ig">{t.auth.instagramLabel}</Label>
              <Input
                id="r-ig"
                dir="ltr"
                placeholder="@yourrestaurant"
                className="h-11"
                {...register("instagram")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-fb">{t.auth.facebookLabel}</Label>
              <Input
                id="r-fb"
                dir="ltr"
                className="h-11"
                {...register("facebook")}
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
                {...register("referral")}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className="font-semibold"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            {t.common.back}
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              className="h-11 min-w-32 shadow-glow"
              onClick={nextStep}
            >
              {t.common.next}
            </Button>
          ) : (
            <Button type="submit" className="h-11 min-w-40 shadow-glow">
              {t.auth.createAccount}
            </Button>
          )}
        </div>
      </form>
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
        type="button"
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
