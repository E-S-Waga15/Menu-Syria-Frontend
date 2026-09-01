"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminLoginSchema,
  type AdminLoginValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";

// Mock console credentials — replaced by the real auth API later
const ADMIN_USERNAME = "MenuSyria";
const ADMIN_PASSWORD = "msms1515@";

export function AdminLogin() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema(t.validation)),
    defaultValues: { username: "", password: "" },
    mode: "onTouched",
  });

  const submit = (values: AdminLoginValues) => {
    if (
      values.username.trim() !== ADMIN_USERNAME ||
      values.password !== ADMIN_PASSWORD
    ) {
      toast.error(t.auth.invalidCredentials);
      return;
    }
    login({
      identifier: values.username.trim(),
      role: "admin",
      name: t.auth.roleAdmin,
    });
    toast.success(fmt(t.auth.welcomeBack, { name: t.auth.roleAdmin }));
    router.push(`/${lang}/admin`);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="space-y-3 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
            <ShieldCheck className="size-7" />
          </span>
          <h1 className="font-heading text-2xl font-bold">
            {t.auth.adminTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.auth.adminBody}</p>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="mt-7 space-y-5 rounded-3xl border border-border/60 bg-card p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="admin-user">{t.auth.usernameLabel}</Label>
            <div className="relative">
              <UserRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-user"
                autoComplete="username"
                placeholder={t.auth.usernamePlaceholder}
                aria-invalid={!!errors.username}
                className="h-12 ps-10"
                {...register("username")}
              />
            </div>
            <FieldError message={errors.username?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-pass">{t.auth.passwordLabel}</Label>
            <div className="relative">
              <Lock className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-pass"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="h-12 ps-10"
                {...register("password")}
              />
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="h-12 w-full text-base">
            {t.auth.signIn}
          </Button>
        </form>
      </div>
    </main>
  );
}
