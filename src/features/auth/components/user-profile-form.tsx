"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { AuthLogoBanner } from "@/components/shared/auth-logo-banner";
import { FieldError } from "@/components/shared/field-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthStepIndicator } from "@/features/auth/components/auth-step-indicator";
import {
  userProfileSchema,
  type UserProfileValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** First-visit account creation — photo is the only optional field. */
export function UserProfileForm() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const login = useAuthStore((s) => s.login);
  const markKnown = useAuthStore((s) => s.markKnown);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema(t.validation)),
    defaultValues: { name: "", birthDate: "", gender: "male" },
    mode: "onTouched",
  });

  const genderOptions = [
    { value: "male" as const, label: t.auth.genderMale },
    { value: "female" as const, label: t.auth.genderFemale },
  ];

  const submit = async (values: UserProfileValues) => {
    markKnown(phone);
    login({
      identifier: phone,
      role: "user",
      name: values.name.trim(),
      avatarUrl: avatarUrl ?? undefined,
    });
    toast.success(fmt(t.auth.welcomeBack, { name: values.name.trim() }));
    router.push(`/${lang}/profile`);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <AuthLogoBanner brand={t.common.brand} />

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="space-y-6 p-8"
        >
          <AuthStepIndicator step={3} />

          <div className="mb-6 space-y-2 text-center">
            <h1 className="font-heading text-2xl font-bold md:text-3xl">
              {t.auth.completeProfileTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.auth.completeProfileBody}
            </p>
            {phone && (
              <p
                className="inline-flex items-center gap-1.5 rounded-full bg-berry-soft px-3 py-1 text-sm font-bold text-berry-soft-foreground"
                dir="ltr"
              >
                {phone}
              </p>
            )}
          </div>

          <FileDropzone
            variant="avatar"
            label={t.auth.photoLabel}
            hint={t.auth.dropzoneHint}
            onFile={(file) => {
              if (!file) {
                setAvatarUrl(null);
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setAvatarUrl(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="u-name">{t.auth.fullNameLabel} *</Label>
            <div className="relative">
              <User className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="u-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className="h-12 ps-10"
                {...register("name")}
              />
            </div>
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="u-birth">{t.auth.birthDateLabel} *</Label>
              <Input
                id="u-birth"
                type="date"
                aria-invalid={!!errors.birthDate}
                className="h-12"
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
                  <div className="flex h-12 gap-2">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        aria-pressed={field.value === option.value}
                        className={cn(
                          "flex-1 rounded-xl border text-sm font-bold transition-[border-color,background-color] duration-200 ease-smooth",
                          field.value === option.value
                            ? "border-primary bg-berry-soft/30 text-primary dark:bg-berry-soft/60"
                            : "border-input bg-transparent text-muted-foreground hover:border-primary/35",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full text-base"
          >
            {t.auth.createMyAccount}
          </Button>
        </form>
      </div>
    </div>
  );
}
