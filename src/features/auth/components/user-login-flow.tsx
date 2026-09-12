"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { AuthLogoBanner } from "@/components/shared/auth-logo-banner";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { AuthStepIndicator } from "@/features/auth/components/auth-step-indicator";
import { RolePickerModal } from "@/features/auth/components/role-picker-modal";
import { useRoleResolution } from "@/features/auth/hooks/use-role-resolution";
import { lookupRolesByPhone } from "@/features/auth/mock-directory";
import {
  otpFormSchema,
  phoneFormSchema,
  type OtpFormValues,
  type PhoneFormValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import { requestOtp, verifyOtp as verifyOtpApi } from "@/features/auth/api";
import { ApiError, IS_MOCK } from "@/lib/api/client";
import { toast } from "@/lib/toast";

const RESEND_SECONDS = 60;

/**
 * Customer sign-in: phone → OTP, then the same role-resolution step the
 * business flow uses. A phone that only ever completed the customer
 * profile resolves to a single "user" role; a phone that also holds a
 * business role gets the account chooser; a phone nobody's seen before
 * continues to profile completion.
 */
export function UserLoginFlow() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const knownPhones = useAuthStore((s) => s.knownPhones);
  const { resolveRoles, finishFromBackend, modalRoles, selectRole, closeModal } =
    useRoleResolution();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [apiError, setApiError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema(t.validation)),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema(t.validation)),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [step, seconds]);

  const fullPhone = `+963 ${phone.trim()}`;

  const requestCode = async (values: PhoneFormValues) => {
    setApiError(null);
    try {
      await requestOtp(`+963${values.phone.trim()}`);
      setPhone(values.phone);
      setStep("otp");
      setSeconds(RESEND_SECONDS);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t.auth.genericError;
      setApiError(msg);
    }
  };

  const verify = async () => {
    setApiError(null);
    const otpCode = otpForm.getValues("otp");
    try {
      const result = await verifyOtpApi(`+963${phone.trim()}`, otpCode);

      if (result.isNewUser) {
        // New phone — send to profile completion, carrying the signup token
        router.push(
          `/${lang}/register/user?phone=${encodeURIComponent(fullPhone)}&signupToken=${encodeURIComponent(result.signupToken)}`,
        );
        return;
      }

      // Existing user — log straight in
      if (IS_MOCK) {
        // In mock mode fall back to the mock directory so knownPhones merging works
        const directoryRoles = lookupRolesByPhone(fullPhone);
        const roles =
          knownPhones.includes(fullPhone) &&
            !directoryRoles.some((r) => r.role === "user")
            ? [...directoryRoles, { role: "user" as const, label: t.auth.roleUser }]
            : directoryRoles;
        const resolved = resolveRoles(fullPhone, roles);
        if (resolved === "none") {
          router.push(
            `/${lang}/register/user?phone=${encodeURIComponent(fullPhone)}&signupToken=mock-signup-token`,
          );
        }
        return;
      }

      finishFromBackend(result.accessToken, result.refreshToken, result.user, fullPhone);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 400 || err.status === 410)
      ) {
        otpForm.setError("otp", { message: t.auth.otpInvalid ?? "Invalid code" });
      } else {
        const msg = err instanceof ApiError ? err.message : t.auth.genericError;
        toast.error(msg);
      }
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <AuthLogoBanner brand={t.common.brand} />

        <div className="p-8">
          <AuthStepIndicator step={step === "phone" ? 1 : 2} />

          <div className="mb-6 space-y-2 text-center">
            <h1 className="font-heading text-2xl font-bold md:text-3xl">
              {step === "phone" ? t.auth.userLoginTitle : t.auth.otpTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "phone" ? t.auth.userLoginBody : t.auth.otpSubtitle}
            </p>
          </div>

          {step === "phone" ? (
            <form
              key="phone"
              onSubmit={phoneForm.handleSubmit(requestCode)}
              noValidate
              className="animate-fade-up space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="phone">{t.auth.phoneLabel}</Label>
                <div className="flex gap-2" dir="ltr">
                  <span className="flex h-12 items-center gap-1.5 rounded-lg border border-input bg-surface-container-low px-3 text-sm font-semibold">
                    🇸🇾 +963
                  </span>
                  <div className="relative flex-1">
                    <Phone className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder={t.auth.phonePlaceholder}
                      aria-invalid={!!phoneForm.formState.errors.phone}
                      className="h-12 ps-10 text-base tracking-wide"
                      {...phoneForm.register("phone")}
                    />
                  </div>
                </div>
                {phoneForm.formState.errors.phone ? (
                  <FieldError
                    message={phoneForm.formState.errors.phone.message}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t.auth.phoneExample}
                  </p>
                )}
              </div>

              {apiError && (
                <p className="text-center text-sm font-semibold text-destructive">
                  {apiError}
                </p>
              )}

              <div className="rounded-xl border border-primary/60 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">
                  {t.auth.phoneInfoBox}
                </p>
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                {t.auth.sendCode}
              </Button>
            </form>
          ) : (
            <form
              key="otp"
              onSubmit={otpForm.handleSubmit(verify)}
              noValidate
              className="animate-fade-up space-y-6"
            >
              <div className="space-y-1.5 text-center">
                <p className="text-sm text-muted-foreground">
                  {t.auth.otpBody}
                </p>
                <p className="text-base font-bold text-primary" dir="ltr">
                  {fullPhone}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-center" dir="ltr">
                  <Controller
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup className="gap-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="size-12 rounded-xl border text-lg font-bold first:rounded-xl last:rounded-xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                </div>
                <p className="text-center">
                  <FieldError message={otpForm.formState.errors.otp?.message} />
                </p>
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                {t.auth.verify}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset();
                  }}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t.auth.changePhone}
                </button>
                {seconds > 0 ? (
                  <span className="font-semibold text-primary tabular-nums">
                    {fmt(t.auth.otpResendIn, { seconds })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await requestOtp(`963${phone.trim()}`);
                        setSeconds(RESEND_SECONDS);
                      } catch (err) {
                        const msg =
                          err instanceof ApiError
                            ? err.message
                            : t.auth.genericError;
                        toast.error(msg);
                      }
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t.auth.otpResend}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          href={`/${lang}/login`}
          className="font-semibold text-primary hover:underline"
        >
          {t.auth.businessLoginLink}
        </Link>
      </p>

      <RolePickerModal
        roles={modalRoles}
        onSelect={selectRole}
        onOpenChange={(open) => !open && closeModal()}
      />
    </div>
  );
}
