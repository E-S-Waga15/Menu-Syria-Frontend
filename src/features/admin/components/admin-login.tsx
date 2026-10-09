"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { AuthBrandPanel } from "@/components/shared/auth-brand-panel";
import { FieldError } from "@/components/shared/field-error";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminLoginSchema,
  type AdminLoginValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { loginAdminWithCredentials } from "@/features/auth/api";
import { ApiError, IS_MOCK } from "@/lib/api/client";
import { fmt, useI18n } from "@/i18n/client";

// Mock console credentials — only used while the backend is not connected.
// Email-shaped so the shared email validation accepts them.
const ADMIN_EMAIL = "admin@menusyria.com";
const ADMIN_PASSWORD = "msms1515@";

export function AdminLogin() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setTokens = useAuthStore((s) => s.setTokens);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema(t.validation)),
    // seeded with the mock credentials while the backend is not connected,
    // so the console stays usable without them written down somewhere else
    defaultValues: IS_MOCK
      ? { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
      : { email: "", password: "" },
    mode: "onTouched",
  });

  const submit = async (values: AdminLoginValues) => {
    // No backend yet: the console opens on the seeded mock credentials.
    if (IS_MOCK) {
      if (
        values.email.trim() !== ADMIN_EMAIL ||
        values.password !== ADMIN_PASSWORD
      ) {
        toast.error(t.auth.invalidCredentials);
        return;
      }
      login({
        identifier: values.email.trim(),
        role: "admin",
        name: t.auth.roleAdmin,
      });
      toast.success(fmt(t.auth.welcomeBack, { name: t.auth.roleAdmin }));
      router.push(`/${lang}/admin`);
      return;
    }

    try {
      const result = await loginAdminWithCredentials(
        values.email.trim(),
        values.password,
      );
      // The credentials endpoint serves every role; only a console account
      // may pass. Rejected users get the same message as a wrong password,
      // so the form never confirms which identifiers exist.
      if (result.user.frontendRole !== "admin") {
        toast.error(t.auth.invalidCredentials);
        return;
      }
      // setTokens also mirrors the access token into the session cookie the
      // console's server components read for their SSR fetches.
      setTokens(result.accessToken, result.refreshToken);
      login({
        identifier: values.email.trim(),
        role: "admin",
        name: result.user.name,
      });
      toast.success(fmt(t.auth.welcomeBack, { name: result.user.name }));
      router.push(`/${lang}/admin`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error(t.auth.invalidCredentials);
      } else {
        const msg = err instanceof ApiError ? err.message : t.auth.genericError;
        toast.error(msg);
      }
    }
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
                <Label htmlFor="admin-email">{t.auth.emailLabel}</Label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t.auth.emailPlaceholder}
                    aria-invalid={!!errors.email}
                    className="h-12 ps-10"
                    {...register("email")}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-pass">{t.auth.passwordLabel}</Label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <PasswordInput
                    id="admin-pass"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    className="h-12 ps-10"
                    {...register("password")}
                  />
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <Button
                type="submit"
                className="h-12 w-full text-base"
                loading={isSubmitting}
              >
                {t.auth.signIn}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
