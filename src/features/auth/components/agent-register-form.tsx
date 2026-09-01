"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Handshake } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "@/lib/toast";

import { FieldError } from "@/components/shared/field-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { GovernorateRegionSelect } from "@/components/shared/governorate-region-select";
import { Button } from "@/components/ui/button";
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
  agentRegisterSchema,
  type AgentRegisterValues,
} from "@/features/auth/schemas";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function AgentRegisterForm() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgentRegisterValues>({
    resolver: zodResolver(agentRegisterSchema(t.validation)),
    defaultValues: {
      name: "",
      phone: "",
      gender: "male",
      governorateId: "",
      regionId: "",
      bio: "",
      instagram: "",
      facebook: "",
    },
    mode: "onTouched",
  });

  const [governorateId, regionId] = useWatch({
    control,
    name: ["governorateId", "regionId"],
  });

  const regionChoices = useMemo(
    () => (regions ?? []).filter((r) => r.governorateId === governorateId),
    [regions, governorateId],
  );

  const genderItems = {
    male: t.auth.genderMale,
    female: t.auth.genderFemale,
  };
  const governorateItems = Object.fromEntries(
    (governorates ?? []).map((g) => [g.id, g.name[lang]]),
  );
  const regionItems = Object.fromEntries(
    regionChoices.map((r) => [r.id, r.name[lang]]),
  );

  const submit = async () => {
    toast.success(t.auth.applicationSent);
    router.push(`/${lang}`);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
          <Handshake className="size-8" />
        </span>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          {t.auth.agentRegTitle}
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
          {t.auth.agentRegBody}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="mt-8 space-y-6 rounded-3xl border border-border/60 bg-card p-6 md:p-10"
      >
        <FileDropzone
          variant="avatar"
          label={t.auth.personalPhotoLabel}
          hint={t.auth.dropzoneHint}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="a-name">{t.auth.fullNameLabel} *</Label>
            <Input
              id="a-name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="h-12"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-phone">{t.auth.phoneLabel} *</Label>
            <Input
              id="a-phone"
              dir="ltr"
              inputMode="tel"
              placeholder="+963 9XX XXX XXX"
              aria-invalid={!!errors.phone}
              className="h-12"
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.auth.genderLabel}</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
                items={genderItems}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(genderItems).map(([id, label]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.auth.governorateLabel} *</Label>
          <GovernorateRegionSelect
            triggerClassName="h-12"
            governorateValue={governorateId}
            onGovernorateChange={(v) => {
              setValue("governorateId", v, { shouldValidate: true });
              setValue("regionId", "");
            }}
            governorateItems={governorateItems}
            governorateAriaLabel={t.auth.governorateLabel}
            governorateInvalid={!!errors.governorateId}
            regionValue={regionId}
            onRegionChange={(v) =>
              setValue("regionId", v, { shouldValidate: true })
            }
            regionItems={regionItems}
            regionAriaLabel={t.agentsPage.region}
            regionDisabled={!governorateId}
          />
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-3">
            <FieldError message={errors.governorateId?.message} />
            <FieldError message={errors.regionId?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="a-bio">{t.auth.bioLabel}</Label>
          <Textarea
            id="a-bio"
            rows={3}
            placeholder={t.auth.bioPlaceholder}
            {...register("bio")}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="a-ig">{t.auth.instagramLabel}</Label>
            <Input
              id="a-ig"
              dir="ltr"
              placeholder="@yourname"
              className="h-12"
              {...register("instagram")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-fb">{t.auth.facebookLabel}</Label>
            <Input id="a-fb" dir="ltr" className="h-12" {...register("facebook")} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full text-base"
        >
          {t.auth.submitApplication}
        </Button>
      </form>
    </div>
  );
}
