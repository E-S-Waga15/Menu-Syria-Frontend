"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/shared/field-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
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
import {
  userProfileSchema,
  type UserProfileValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import type { Governorate, Region } from "@/lib/types";

const NONE = "none";

/** First-visit profile completion — photo & location optional by design. */
export function UserProfileForm({
  governorates,
  regions,
}: {
  governorates: Governorate[];
  regions: Region[];
}) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const login = useAuthStore((s) => s.login);
  const markKnown = useAuthStore((s) => s.markKnown);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema(t.validation)),
    defaultValues: {
      name: "",
      birthDate: "",
      gender: "male",
      governorateId: NONE,
      regionId: NONE,
    },
    mode: "onTouched",
  });

  const governorateId = useWatch({ control, name: "governorateId" });
  const regionChoices = regions.filter(
    (r) => r.governorateId === governorateId,
  );

  const genderItems = {
    male: t.auth.genderMale,
    female: t.auth.genderFemale,
  };
  const governorateItems = {
    [NONE]: `— (${t.common.optional})`,
    ...Object.fromEntries(governorates.map((gov) => [gov.id, gov.name[lang]])),
  };
  const regionItems = {
    [NONE]: `— (${t.common.optional})`,
    ...Object.fromEntries(
      regionChoices.map((region) => [region.id, region.name[lang]]),
    ),
  };

  const submit = (values: UserProfileValues) => {
    markKnown(phone);
    login({ identifier: phone, role: "user", name: values.name.trim() });
    toast.success(fmt(t.auth.welcomeBack, { name: values.name.trim() }));
    router.push(`/${lang}`);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold">
          {t.auth.completeProfileTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.auth.completeProfileBody}
        </p>
        {phone && (
          <p className="text-sm font-bold text-primary" dir="ltr">
            {phone}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="mt-7 space-y-5 rounded-3xl border border-border/60 bg-card p-8"
      >
        <div className="space-y-2">
          <Label>
            {t.auth.photoLabel}{" "}
            <span className="font-normal text-muted-foreground">
              ({t.common.optional})
            </span>
          </Label>
          <FileDropzone label={t.auth.photoLabel} hint={t.auth.dropzoneHint} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="u-name">{t.auth.fullNameLabel} *</Label>
          <Input
            id="u-name"
            aria-invalid={!!errors.name}
            className="h-11"
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="u-birth">{t.auth.birthDateLabel} *</Label>
            <Input
              id="u-birth"
              type="date"
              aria-invalid={!!errors.birthDate}
              className="h-11"
              {...register("birthDate")}
            />
            <FieldError message={errors.birthDate?.message} />
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
                  <SelectTrigger className="h-11 w-full">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t.auth.governorateLabel}{" "}
              <span className="font-normal text-muted-foreground">
                ({t.common.optional})
              </span>
            </Label>
            <Controller
              control={control}
              name="governorateId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (!v) return;
                    field.onChange(v);
                    setValue("regionId", NONE);
                  }}
                  items={governorateItems}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(governorateItems).map(([id, label]) => (
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
            <Label>
              {t.agentsPage.region}{" "}
              <span className="font-normal text-muted-foreground">
                ({t.common.optional})
              </span>
            </Label>
            <Controller
              control={control}
              name="regionId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => v && field.onChange(v)}
                  items={regionItems}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(regionItems).map(([id, label]) => (
                      <SelectItem key={id} value={id}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full text-base">
          {t.auth.createMyAccount}
        </Button>
      </form>
    </div>
  );
}
