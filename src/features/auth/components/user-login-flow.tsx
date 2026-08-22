"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  otpFormSchema,
  phoneFormSchema,
  type OtpFormValues,
  type PhoneFormValues,
} from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";

const RESEND_SECONDS = 45;

/**
 * Customer sign-in: phone → OTP. Known phones go straight into the app;
 * first-timers continue to the profile-completion page.
 */
export function UserLoginFlow() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const knownPhones = useAuthStore((s) => s.knownPhones);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

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

  const requestCode = (values: PhoneFormValues) => {
    setPhone(values.phone);
    setStep("otp");
    setSeconds(RESEND_SECONDS);
  };

  const verify = () => {
    if (knownPhones.includes(fullPhone)) {
      // returning customer — straight in
      login({ identifier: fullPhone, role: "user", name: t.auth.roleUser });
      toast.success(fmt(t.auth.welcomeBack, { name: t.auth.roleUser }));
      router.push(`/${lang}`);
      return;
    }
    // first visit — collect their profile
    router.push(`/${lang}/register/user?phone=${encodeURIComponent(fullPhone)}`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
          <UserRound className="size-7" />
        </span>
        <h1 className="font-heading text-2xl font-bold">
          {t.auth.userLoginTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{t.auth.userLoginBody}</p>
      </div>

      <div className="mt-7 rounded-3xl border border-border/60 bg-card p-8">
        {step === "phone" ? (
          <form
            onSubmit={phoneForm.handleSubmit(requestCode)}
            noValidate
            className="space-y-6"
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
              <FieldError
                message={phoneForm.formState.errors.phone?.message}
              />
            </div>

            <Button type="submit" className="h-12 w-full text-base">
              {t.auth.sendCode}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(verify)}
            noValidate
            className="space-y-6"
          >
            <p className="text-center text-sm text-muted-foreground">
              {fmt(t.auth.otpBody, { phone: fullPhone })}
            </p>

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
                <FieldError
                  message={otpForm.formState.errors.otp?.message}
                />
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
                  onClick={() => setSeconds(RESEND_SECONDS)}
                  className="font-semibold text-primary hover:underline"
                >
                  {t.auth.otpResend}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link
          href={`/${lang}/login`}
          className="font-semibold text-primary hover:underline"
        >
          {t.auth.businessLoginLink}
        </Link>
      </p>
    </div>
  );
}
