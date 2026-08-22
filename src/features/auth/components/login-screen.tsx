"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ConciergeBell,
  Handshake,
  KeyRound,
  Lock,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type BusinessRole = Extract<UserRole, "owner" | "agent" | "waiter">;
type Method = "phone" | "credentials";

/**
 * Business sign-in (owner / agent / waiter) — each can enter with
 * phone + OTP or username + password. Customers have their own flow.
 */
export function LoginScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [role, setRole] = useState<BusinessRole>("owner");
  const [method, setMethod] = useState<Method>("phone");
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

  const roles: {
    id: BusinessRole;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    desc: string;
    chip: string;
  }[] = [
    {
      id: "owner",
      icon: Store,
      label: t.auth.roleOwner,
      desc: t.auth.roleOwnerDesc,
      chip: "bg-berry-soft text-berry-soft-foreground",
    },
    {
      id: "agent",
      icon: Handshake,
      label: t.auth.roleAgent,
      desc: t.auth.roleAgentDesc,
      chip: "bg-success/10 text-success",
    },
    {
      id: "waiter",
      icon: ConciergeBell,
      label: t.auth.roleWaiter,
      desc: t.auth.roleWaiterDesc,
      chip: "bg-zest-soft text-zest-soft-foreground",
    },
  ];

  const destinations: Record<BusinessRole, string> = {
    owner: `/${lang}/dashboard`,
    agent: `/${lang}/agent`,
    waiter: `/${lang}/dashboard/orders`,
  };

  const activeRole = roles.find((r) => r.id === role)!;
  const fullPhone = `+963 ${phone.trim()}`;

  const selectRole = (next: BusinessRole) => {
    setRole(next);
    setStep("phone");
    otpForm.reset();
  };

  const finishLogin = (identifier: string) => {
    login({ identifier, role, name: activeRole.label });
    toast.success(fmt(t.auth.welcomeBack, { name: activeRole.label }));
    router.push(destinations[role]);
  };

  const requestCode = (values: PhoneFormValues) => {
    setPhone(values.phone);
    setStep("otp");
    setSeconds(RESEND_SECONDS);
  };

  const verifyOtp = () => finishLogin(fullPhone);

  const submitCredentials = (values: CredentialsValues) =>
    finishLogin(values.username.trim());

  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold">{t.auth.loginTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.rolesSubtitle}</p>
      </div>

      {/* role cards */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {roles.map((item) => {
          const isActive = item.id === role;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectRole(item.id)}
              aria-pressed={isActive}
              className={cn(
                "flex transform-gpu flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-[translate,scale,border-color,background-color] duration-200 ease-smooth",
                isActive
                  ? "border-primary bg-berry-soft/30 dark:bg-berry-soft/60"
                  : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-primary/35",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  item.chip,
                )}
              >
                <item.icon className="size-5.5" />
              </span>
              <span className="text-sm font-bold">{item.label}</span>
              <span className="hidden text-[0.7rem] leading-snug text-muted-foreground sm:block">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* form panel */}
      <div className="mx-auto mt-6 max-w-md rounded-3xl border border-border/60 bg-card p-8">
        {/* method switch: OTP or credentials */}
        <Tabs
          value={method}
          onValueChange={(v) => v && setMethod(v as Method)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" className="gap-1.5">
              <Phone className="size-3.5" />
              {t.auth.methodPhone}
            </TabsTrigger>
            <TabsTrigger value="credentials" className="gap-1.5">
              <KeyRound className="size-3.5" />
              {t.auth.methodCredentials}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          {method === "phone" ? (
            step === "phone" ? (
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
                onSubmit={otpForm.handleSubmit(verifyOtp)}
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
            )
          ) : (
            <form
              onSubmit={credentialsForm.handleSubmit(submitCredentials)}
              noValidate
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="username">{t.auth.usernameLabel}</Label>
                <div className="relative">
                  <UserRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder={t.auth.usernamePlaceholder}
                    aria-invalid={!!credentialsForm.formState.errors.username}
                    className="h-12 ps-10"
                    {...credentialsForm.register("username")}
                  />
                </div>
                <FieldError
                  message={credentialsForm.formState.errors.username?.message}
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
                    aria-invalid={!!credentialsForm.formState.errors.password}
                    className="h-12 ps-10"
                    {...credentialsForm.register("password")}
                  />
                </div>
                <FieldError
                  message={credentialsForm.formState.errors.password?.message}
                />
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                {t.auth.signIn}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link
            href={`/${lang}/login/user`}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.customerLoginLink}
          </Link>
        </p>
        <p className="text-muted-foreground">
          {t.auth.noAccount}{" "}
          <Link
            href={`/${lang}/register/restaurant`}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.registerRestaurantLink}
          </Link>{" "}
          ·{" "}
          <Link
            href={`/${lang}/register/store`}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.storeRegTitle}
          </Link>{" "}
          ·{" "}
          <Link
            href={`/${lang}/register/agent`}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.registerAgentLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
