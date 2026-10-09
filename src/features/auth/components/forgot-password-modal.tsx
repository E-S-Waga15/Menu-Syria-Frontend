"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { FieldError } from "@/components/shared/field-error";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  phoneFormSchema,
  resetPasswordSchema,
  type PhoneFormValues,
  type ResetPasswordValues,
} from "@/features/auth/schemas";
import { requestOtp, resetPassword } from "@/features/auth/api";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/i18n/client";

/**
 * "Forgot password?" — reuses the same phone + OTP fields the login screen
 * uses, but in a modal clearly its own thing: a different heading and icon,
 * and a note that it never signs anyone in. The backend verifies the code
 * and sets the password in one call, so there's no separate "verify" step
 * between entering the code and choosing a new password — both happen on
 * the same screen.
 */
export function ForgotPasswordModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema(t.validation)),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(t.validation)),
    defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" },
    mode: "onTouched",
  });

  const reset = () => {
    setStep("phone");
    setPhone("");
    phoneForm.reset();
    resetForm.reset();
  };

  const requestCode = async (values: PhoneFormValues) => {
    try {
      const { message } = await requestOtp(`963${values.phone.trim()}`);
      toast.success(message);
      setPhone(values.phone);
      setStep("reset");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t.auth.genericError);
    }
  };

  const submitReset = async (values: ResetPasswordValues) => {
    try {
      const { message } = await resetPassword(
        `963${phone.trim()}`,
        values.otp,
        values.newPassword,
        values.confirmNewPassword,
      );
      toast.success(message || t.auth.resetPasswordSuccess);
      setOpen(false);
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        resetForm.setError("otp", { message: t.auth.resetCodeInvalid });
      } else {
        toast.error(err instanceof ApiError ? err.message : t.auth.genericError);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
          />
        }
      >
        {t.auth.forgotPassword}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.auth.resetPasswordTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <KeyRound className="size-5.5" />
          </span>
          <p className="text-sm text-muted-foreground">
            {step === "phone" ? t.auth.resetPasswordPhoneBody : t.auth.resetPasswordOtpBody}
          </p>
        </div>

        {step === "phone" ? (
          <form
            onSubmit={phoneForm.handleSubmit(requestCode)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="fp-phone">{t.auth.phoneLabel}</Label>
              <div className="flex gap-2" dir="ltr">
                <span className="flex h-12 items-center gap-1.5 rounded-lg border border-input bg-surface-container-low px-3 text-sm font-semibold">
                  🇸🇾 +963
                </span>
                <Input
                  id="fp-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder={t.auth.phonePlaceholder}
                  aria-invalid={!!phoneForm.formState.errors.phone}
                  className="h-12 flex-1 text-base tracking-wide"
                  {...phoneForm.register("phone")}
                />
              </div>
              <FieldError message={phoneForm.formState.errors.phone?.message} />
            </div>
            <Button
              type="submit"
              loading={phoneForm.formState.isSubmitting}
              className="h-12 w-full text-base"
            >
              {t.auth.sendCode}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(submitReset)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-2">
              <div className="flex justify-center" dir="ltr">
                <Controller
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="size-11 rounded-xl border text-lg font-bold first:rounded-xl last:rounded-xl"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
              </div>
              <p className="text-center">
                <FieldError message={resetForm.formState.errors.otp?.message} />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fp-new-password">{t.auth.newPasswordLabel}</Label>
              <PasswordInput
                id="fp-new-password"
                autoComplete="new-password"
                aria-invalid={!!resetForm.formState.errors.newPassword}
                className="h-12"
                {...resetForm.register("newPassword")}
              />
              <FieldError message={resetForm.formState.errors.newPassword?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fp-confirm-password">{t.auth.confirmPasswordLabel}</Label>
              <PasswordInput
                id="fp-confirm-password"
                autoComplete="new-password"
                aria-invalid={!!resetForm.formState.errors.confirmNewPassword}
                className="h-12"
                {...resetForm.register("confirmNewPassword")}
              />
              <FieldError
                message={resetForm.formState.errors.confirmNewPassword?.message}
              />
            </div>

            <Button
              type="submit"
              loading={resetForm.formState.isSubmitting}
              className="h-12 w-full text-base"
            >
              {t.auth.resetPasswordSubmit}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              {t.auth.resetPasswordSecurityNote}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
