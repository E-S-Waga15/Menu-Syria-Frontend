"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";

const RESEND_SECONDS = 45;

export function LoginForm() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [step, seconds]);

  const fullPhone = `+963 ${phone}`;

  const requestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 9) return;
    setStep("otp");
    setSeconds(RESEND_SECONDS);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    login({ phone: fullPhone, role: "restaurant", name: "بيت الياسمين" });
    toast.success(t.auth.loginTitle);
    router.push(`/${lang}/dashboard`);
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-lifted md:p-10">
      {step === "phone" ? (
        <form onSubmit={requestCode} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-2xl font-bold">
              {t.auth.loginTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{t.auth.loginBody}</p>
          </div>

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
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^\d\s]/g, ""))
                  }
                  className="h-12 ps-10 text-base tracking-wide"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full text-base shadow-glow"
            disabled={phone.trim().length < 9}
          >
            {t.auth.sendCode}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <a
              href={`/${lang}/register/restaurant`}
              className="font-semibold text-primary hover:underline"
            >
              {t.auth.registerRestaurantLink}
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-2xl font-bold">
              {t.auth.otpTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {fmt(t.auth.otpBody, { phone: fullPhone })}
            </p>
          </div>

          <div className="flex justify-center" dir="ltr">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
          </div>

          <Button
            type="submit"
            className="h-12 w-full text-base shadow-glow"
            disabled={otp.length !== 6}
          >
            {t.auth.verify}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
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
  );
}
