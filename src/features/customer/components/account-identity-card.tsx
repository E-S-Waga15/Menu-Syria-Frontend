"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Pencil, Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/shared/field-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/features/auth/store";
import {
  customerProfileSchema,
  type CustomerProfileValues,
} from "@/features/customer/schemas";
import type {
  CustomerAccount,
  CustomerProfileInput,
} from "@/features/customer/services";
import { fmt, useI18n } from "@/i18n/client";

/**
 * Who the account belongs to: photo, identity line, and the two fields the
 * customer owns. The fields stay on screen at rest and turn editable together,
 * so the card never hides what is on file — and every write resets them to the
 * server's answer.
 */
export function AccountIdentityCard({
  account,
  onSave,
  isSaving,
  onAvatarFile,
  isUpdatingAvatar,
}: {
  account: CustomerAccount;
  /** Rejects when the write failed — the card keeps the form open then. */
  onSave: (input: CustomerProfileInput) => Promise<unknown>;
  isSaving: boolean;
  onAvatarFile: (file: File) => void;
  isUpdatingAvatar: boolean;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema(t.validation)),
    defaultValues: { name: account.name, email: account.email ?? "" },
    mode: "onTouched",
  });

  // the server is the source of truth: every write (and the invalidate that
  // follows it) lands here, so the fields can never drift from what is on file
  useEffect(() => {
    reset({ name: account.name, email: account.email ?? "" });
  }, [account.name, account.email, reset]);

  const submit = async (values: CustomerProfileValues) => {
    try {
      await onSave({
        name: values.name.trim(),
        // blank means "leave the address on file alone": the API cannot clear
        // an email, and an empty string is not an address
        email: values.email.trim() || undefined,
      });
      setEditing(false);
    } catch {
      // the mutation already showed why; keeping the form open lets the
      // customer fix it rather than hunt for what went wrong
    }
  };

  const roleLabels: Record<UserRole, string> = {
    user: t.auth.roleUser,
    owner: t.auth.roleOwner,
    agent: t.auth.roleAgent,
    waiter: t.auth.roleWaiter,
    admin: t.auth.roleAdmin,
  };

  const memberSince = new Date(account.createdAt).toLocaleDateString(
    lang === "ar" ? "ar-SY" : "en-US",
  );

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <FileDropzone
            variant="avatar"
            label={t.account.photoLabel}
            previewUrl={account.avatarUrl}
            onFile={(file) => {
              if (file) onAvatarFile(file);
            }}
          />
          {isUpdatingAvatar && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2 className="size-6 animate-spin text-primary" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-start">
          <h1 className="font-heading text-2xl font-bold md:text-3xl">
            {account.name || account.email}
          </h1>
          <p
            className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start"
            dir="ltr"
          >
            <Mail className="size-3.5" />
            {account.email ?? t.account.noEmail}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
            <Badge variant="secondary">{roleLabels[account.frontendRole]}</Badge>
            <Badge variant="outline">
              {fmt(t.account.memberSince, { date: memberSince })}
            </Badge>
            <Badge variant="outline">
              {fmt(t.account.ordersPlaced, { count: account.stats.orders })}
            </Badge>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {isUpdatingAvatar ? t.account.photoUploading : t.account.photoHint}
          </p>
        </div>

        {!editing && (
          <Button
            variant="outline"
            className="h-10 shrink-0 gap-1.5"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
            {t.account.editDetails}
          </Button>
        )}
      </div>

      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="mt-7 border-t border-border/60 pt-7"
      >
        <h2 className="font-heading text-lg font-semibold">
          {t.account.personalInfo}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-name">{t.account.nameLabel}</Label>
            <Input
              id="account-name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="h-11"
              disabled={!editing}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-email">{t.account.emailLabel}</Label>
            <Input
              id="account-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder={t.account.emailPlaceholder}
              aria-invalid={!!errors.email}
              className="h-11"
              disabled={!editing}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>
        </div>

        {!account.email && (
          <p className="mt-3 text-xs text-muted-foreground">
            {t.account.emailHint}
          </p>
        )}

        {editing && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={isSaving}
              className="h-10 gap-1.5 px-4"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t.common.save}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              onClick={() => {
                reset({ name: account.name, email: account.email ?? "" });
                setEditing(false);
              }}
            >
              {t.common.cancel}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}