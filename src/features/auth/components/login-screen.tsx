"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  Handshake,
  KeyRound,
  Lock,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/lib/toast";

import { AuthBrandPanel } from "@/components/shared/auth-brand-panel";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { RolePickerModal } from "@/features/auth/components/role-picker-modal";
import { useRoleResolution } from "@/features/auth/hooks/use-role-resolution";
import { destinationForRole } from "@/features/auth/lib/destinations";
import { getRoleMeta } from "@/features/auth/role-meta";
import {
  credentialsSchema,
  otpFormSchema,
  phoneFormSchema,
  type CredentialsValues,
  type OtpFormValues,
  type PhoneFormValues,
} from "@/features/auth/schemas";
import { useAuthStore, type UserRole } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 45;

type CredentialsRole = Extract<UserRole, "owner" | "agent" | "waiter">;
type Method = "phone" | "credentials";

/**
 * Business sign-in (owner / agent / waiter): one unified phone+OTP entry —
 * the role is resolved from the phone number after verification, not
 * picked upfront. A username+password fallback stays available; since that
 * path has no phone to resolve a role from, it keeps a small manual role
 * picker of its own.
 */
export function LoginScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const roleMeta = getRoleMeta(t);
  const { resolve, modalRoles, selectRole, closeModal } = useRoleResolution();

  const [method, setMethod] = useState<Method>("phone");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [notFound, setNotFound] = useState(false);
  const [credRole, setCredRole] = useState<CredentialsRole>("owner");

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema(t.validation)),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema(t.validation)),
    defaultValues: { otp: "" },
  });
  const credentialsForm = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema(t.validation)),
    defaultValues: { username: "", password: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (method !== "phone" || step !== "otp" || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [method, step, seconds]);

  const credentialRoles: CredentialsRole[] = ["owner", "agent", "waiter"];
  const fullPhone = `+963 ${phone.trim()}`;

  const requestCode = (values: PhoneFormValues) => {
    setPhone(values.phone);
    setStep("otp");
    setSeconds(RESEND_SECONDS);
    setNotFound(false);
  };

  const verifyOtp = () => {
    setNotFound(false);
    const result = resolve(fullPhone);
    if (result === "none") setNotFound(true);
  };

  /** flip between the two entry methods, rewinding the phone flow so the
   * user never comes back to a half-finished OTP step */
  const switchMethod = () => {
    setMethod((m) => (m === "phone" ? "credentials" : "phone"));
    setStep("phone");
    setNotFound(false);
    otpForm.reset();
  };

  const submitCredentials = (values: CredentialsValues) => {
    const meta = roleMeta[credRole];
    login({
      identifier: values.username.trim(),
      role: credRole,
      name: meta.label,
      // the mocked username/password path has no real profile lookup to
      // derive this from — restaurant is the reasonable default
      businessType: credRole === "owner" ? "restaurant" : undefined,
    });
    toast.success(fmt(t.auth.welcomeBack, { name: meta.label }));
    router.push(destinationForRole(lang, credRole));
  };

  const otpStep = method === "phone" && step === "otp";

  /** the credentials role picker, rendered on the berry panel — white-on-berry
   * instead of the soft chips it used inside the card */
  const rolePicker = (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
      {credentialRoles.map((r) => {
        const meta = roleMeta[r];
        const isActive = r === credRole;
        return (
          <button
            key={r}
            type="button"
            onClick={() => setCredRole(r)}
            aria-pressed={isActive}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3 text-start transition-[border-color,background-color,color] duration-200 ease-smooth",
              isActive
                ? "border-white bg-white text-berry"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                isActive
                  ? "bg-berry-soft text-berry-soft-foreground"
                  : "bg-white/15 text-white",
              )}
            >
              <meta.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{meta.label}</span>
              <span
                className={cn(
                  "block truncate text-xs",
                  isActive ? "text-berry/70" : "text-white/70",
                )}
              >
                {meta.desc}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card lg:grid lg:grid-cols-2">
        <AuthBrandPanel
          brand={t.common.brand}
          title={t.auth.loginTitle}
          subtitle={
            method === "credentials"
              ? t.auth.panelChooseRole
              : t.auth.panelAutoRole
          }
        >
          {method === "credentials" && rolePicker}
        </AuthBrandPanel>

        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          {/* the fields take the free height and stay optically centred against
              the taller brand half; the method switch keeps the foot */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-start">
              {otpStep && (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-berry-soft text-berry-soft-foreground">
                  <ShieldCheck className="size-5" />
                </span>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="font-heading text-xl font-bold">
                  {otpStep ? t.auth.otpTitle : t.auth.signIn}
                </h2>
                {(otpStep || method === "phone") && (
                  <p className="text-sm text-muted-foreground">
                    {otpStep ? t.auth.otpSubtitle : t.auth.loginBody}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              {method === "phone" ? (
                step === "phone" ? (
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
                    key="otp"
                    onSubmit={otpForm.handleSubmit(verifyOtp)}
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
                        <FieldError
                          message={otpForm.formState.errors.otp?.message}
                        />
                      </p>
                      {notFound && (
                        <p className="text-center text-sm font-semibold text-destructive">
                          {t.auth.accountNotFound}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="h-12 w-full text-base">
                      {t.auth.verify}
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setStep("phone");
                          setNotFound(false);
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
                )
              ) : (
                <form
                  key="credentials"
                  onSubmit={credentialsForm.handleSubmit(submitCredentials)}
                  noValidate
                  className="animate-fade-up space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">{t.auth.usernameLabel}</Label>
                    <div className="relative">
                      <UserRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        autoComplete="username"
                        placeholder={t.auth.usernamePlaceholder}
                        aria-invalid={
                          !!credentialsForm.formState.errors.username
                        }
                        className="h-12 ps-10"
                        {...credentialsForm.register("username")}
                      />
                    </div>
                    <FieldError
                      message={
                        credentialsForm.formState.errors.username?.message
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t.auth.passwordLabel}</Label>
                      <a
                        href="#"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {t.auth.forgotPassword}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={
                          !!credentialsForm.formState.errors.password
                        }
                        className="h-12 ps-10"
                        {...credentialsForm.register("password")}
                      />
                    </div>
                    <FieldError
                      message={
                        credentialsForm.formState.errors.password?.message
                      }
                    />
                  </div>

                  <Button type="submit" className="h-12 w-full text-base">
                    {t.auth.signIn}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* foot of the column: the alternate entry method, then the
              create-account menu. The menu stays visible during the OTP step
              because `accountNotFound` tells the user to sign up from here. */}
          <div className="mt-8 space-y-5 border-t border-border/60 pt-6 lg:mt-10 lg:pt-7">
            {!otpStep && (
              <Button
                type="button"
                variant="outline"
                onClick={switchMethod}
                className="h-12 w-full gap-2 border-[1.5px] text-sm font-semibold"
              >
                {method === "phone" ? (
                  <KeyRound className="size-4" />
                ) : (
                  <Phone className="size-4" />
                )}
                {method === "phone"
                  ? t.auth.switchToCredentials
                  : t.auth.switchToPhone}
              </Button>
            )}

            <div className="space-y-2.5 text-center">
              <p className="text-sm text-muted-foreground">
                {t.auth.noAccount}
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-12 w-full gap-1.5 border-[1.5px] border-primary/40 text-sm font-semibold text-primary hover:bg-berry-soft/40 hover:text-primary"
                    />
                  }
                >
                  {t.auth.createAccountCta}
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                {/* portalled, so the card's overflow-hidden never clips it;
                    DropdownMenuContent already sizes to --anchor-width, so it
                    lands exactly as wide as the full-width trigger */}
                <DropdownMenuContent
                  side="bottom"
                  align="center"
                  sideOffset={6}
                >
                  <DropdownMenuItem
                    render={<Link href={`/${lang}/register/restaurant`} />}
                  >
                    <UtensilsCrossed className="size-4" />
                    {t.auth.registerRestaurantLink}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/${lang}/register/store`} />}
                  >
                    <ShoppingBag className="size-4" />
                    {t.auth.storeRegTitle}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/${lang}/register/agent`} />}
                  >
                    <Handshake className="size-4" />
                    {t.auth.registerAgentLink}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <RolePickerModal
        roles={modalRoles}
        onSelect={selectRole}
        onOpenChange={(open) => !open && closeModal()}
      />
    </div>
  );
}
