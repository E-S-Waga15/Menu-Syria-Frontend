"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { FieldError } from "@/components/shared/field-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customerPhoneSchema,
  type CustomerPhoneValues,
} from "@/features/customer/schemas";
import type {
  CustomerPhone,
  CustomerPhoneInput,
  CustomerPhoneType,
} from "@/features/customer/services";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const PHONE_TYPES: CustomerPhoneType[] = ["mobile", "whatsapp", "landline"];

/** Digits only, country code and trunk zero dropped — so the number a customer
 * signs in with matches its own row however either side was written. */
function comparableDigits(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/^963/, "")
    .replace(/^0/, "");
}

/**
 * Every number on the account, with the one that signs in flagged.
 *
 * Removal is blocked for the last remaining number: with OTP-first sign-in it
 * is the only way back in, so the button is disabled rather than failing after
 * the fact.
 */
export function PhoneNumbersCard({
  phones,
  sessionIdentifier,
  onAdd,
  isAdding,
  onRemove,
  removingPhoneId,
}: {
  phones: CustomerPhone[];
  /** the number or email this session signed in with */
  sessionIdentifier: string;
  onAdd: (input: CustomerPhoneInput) => Promise<unknown>;
  isAdding: boolean;
  onRemove: (phoneId: string) => void;
  removingPhoneId: string | null;
}) {
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerPhoneValues>({
    resolver: zodResolver(customerPhoneSchema(t.validation)),
    defaultValues: { number: "", numberType: "mobile" },
    mode: "onTouched",
  });

  const typeLabels: Record<CustomerPhoneType, string> = {
    mobile: t.account.typeMobile,
    whatsapp: t.account.typeWhatsapp,
    landline: t.account.typeLandline,
  };

  const signedInDigits = comparableDigits(sessionIdentifier);
  const canRemove = phones.length > 1;

  const submit = async (values: CustomerPhoneValues) => {
    try {
      await onAdd(values);
      reset({ number: "", numberType: values.numberType });
      setAdding(false);
    } catch {
      // the mutation surfaced the reason — a number that belongs to someone
      // else, most often — so the form stays filled in for a correction
    }
  };

  return (
    <section className="flex flex-col rounded-3xl border border-border/60 bg-card p-6">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Phone className="size-5 text-primary" />
        {t.account.phonesTitle}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t.account.phonesBody}
      </p>

      {phones.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t.account.emptyPhones}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {phones.map((phone) => (
            <li
              key={phone.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3.5"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold" dir="ltr">
                  {phone.number}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">
                    {typeLabels[phone.numberType]}
                  </Badge>
                  {signedInDigits !== "" &&
                    comparableDigits(phone.number) === signedInDigits && (
                      <Badge variant="outline">
                        {t.account.phoneSignIn}
                      </Badge>
                    )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.account.removePhone}
                title={
                  canRemove ? t.account.removePhone : t.account.phoneOnlyWarning
                }
                disabled={!canRemove || removingPhoneId === phone.id}
                onClick={() => onRemove(phone.id)}
                className={cn(
                  "shrink-0 text-muted-foreground",
                  canRemove &&
                    "hover:bg-destructive/10 hover:text-destructive",
                )}
              >
                {removingPhoneId === phone.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {phones.length === 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t.account.phoneOnlyWarning}
        </p>
      )}

      <div className="mt-5 flex-1" />

      {adding ? (
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="space-y-4 rounded-2xl border border-dashed border-border p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="phone-number">{t.account.phoneNumberLabel}</Label>
            <Input
              id="phone-number"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t.account.phoneNumberPlaceholder}
              aria-invalid={!!errors.number}
              className="h-11"
              {...register("number")}
            />
            <FieldError message={errors.number?.message} />
          </div>

          <div className="space-y-2">
            <Label>{t.account.phoneTypeLabel}</Label>
            <Controller
              control={control}
              name="numberType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as CustomerPhoneType)
                  }
                >
                  <SelectTrigger className="h-11! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={isAdding}
              className="h-10 gap-1.5 px-4"
            >
              {isAdding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t.common.add}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              onClick={() => {
                reset({ number: "", numberType: "mobile" });
                setAdding(false);
              }}
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="mt-5 h-10 w-full gap-1.5"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-4" />
          {t.account.addPhone}
        </Button>
      )}
    </section>
  );
}