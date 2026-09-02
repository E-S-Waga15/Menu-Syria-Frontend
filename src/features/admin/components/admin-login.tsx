"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { AuthBrandPanel } from "@/components/shared/auth-brand-panel";
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
    // seeded with the console credentials while auth is mocked, so the
    // portal is usable without them being written down somewhere else
    defaultValues: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
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
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      {/* Same split card the business portal uses — the console is a peer of
          the other entry points, not a different-looking side door. It carries
          one method only, so there is no method switch and no sign-up route:
          console accounts are provisioned, never self-registered. */}
      <div className="w-full max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card lg:grid lg:grid-cols-2">
          <AuthBrandPanel
            brand={t.common.brand}
            title={t.auth.adminTitle}
            subtitle={t.auth.adminBody}
            compactText
          />

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-start">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <h2 className="font-heading text-xl font-bold">
                {t.auth.signIn}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(submit)}
              noValidate
              className="mt-6 space-y-5"
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
        </div>
      </div>
    </main>
  );
}
