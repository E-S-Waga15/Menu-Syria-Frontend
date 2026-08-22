"use client";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  buildWhatsAppOrderUrl,
  formatPrice,
  type StorefrontCopy,
} from "@/features/public-menu/lib/format";
import {
  cartDetailsSchema,
  type CartDetailsValues,
} from "@/features/public-menu/schemas";
import { useI18n } from "@/i18n/client";
import type { Business } from "@/lib/types";
import {
  lineUnitPrice,
  selectCartTotal,
  useCartStore,
} from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

export function CartSheet({
  business,
  copy,
  showTable = true,
}: {
  business: Business;
  copy: StorefrontCopy;
  showTable?: boolean;
}) {
  const { t, lang } = useI18n();
  const isOpen = useUiStore((s) => s.isCartSheetOpen);
  const setOpen = useUiStore((s) => s.setCartSheetOpen);

  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore(selectCartTotal);

  // no submit handler here — the WhatsApp link is the action, so the form
  // validates live and the URL recomputes from watched values
  const {
    register,
    control,
    formState: { errors },
  } = useForm<CartDetailsValues>({
    resolver: zodResolver(cartDetailsSchema(t.validation)),
    defaultValues: { tableNumber: "", customerName: "", notes: "" },
    mode: "onChange",
  });
  const [tableNumber, customerName, notes] = useWatch({
    control,
    name: ["tableNumber", "customerName", "notes"],
  });

  const whatsappUrl = buildWhatsAppOrderUrl({
    business,
    lines,
    lang,
    copy,
    currency: t.common.currency,
    total,
    tableNumber: tableNumber.trim() || undefined,
    customerName: customerName.trim() || undefined,
    notes: notes.trim() || undefined,
  });

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] max-w-2xl overflow-y-auto rounded-t-3xl pb-6"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-lg">{copy.yourOrder}</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="font-semibold">{copy.emptyCart}</p>
            <p className="text-sm text-muted-foreground">
              {copy.emptyCartBody}
            </p>
          </div>
        ) : (
          <div className="space-y-5 px-4">
            <ul className="divide-y divide-border/70">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3 py-3">
                  <Image
                    src={line.item.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {line.item.name[lang]}
                    </p>
                    {line.options.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {line.options.map((o) => o.name[lang]).join("، ")}
                      </p>
                    )}
                    <p
                      className="mt-0.5 text-sm font-bold text-[var(--menu-primary)]"
                      dir="ltr"
                    >
                      {formatPrice(
                        lineUnitPrice(line) * line.quantity,
                        t.common.currency,
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="-"
                      onClick={() => setQuantity(line.key, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-7 text-center text-sm font-bold">
                      {line.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="+"
                      onClick={() => setQuantity(line.key, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.common.delete}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(line.key)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 sm:grid-cols-2">
              {showTable && (
                <div className="space-y-1.5">
                  <Label htmlFor="cart-table">
                    {copy.tableNumber}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({t.common.optional})
                    </span>
                  </Label>
                  <Input
                    id="cart-table"
                    inputMode="numeric"
                    aria-invalid={!!errors.tableNumber}
                    className="h-10"
                    {...register("tableNumber")}
                  />
                  <FieldError message={errors.tableNumber?.message} />
                </div>
              )}
              <div className={showTable ? "space-y-1.5" : "space-y-1.5 sm:col-span-2"}>
                <Label htmlFor="cart-name">
                  {copy.customerName}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({t.common.optional})
                  </span>
                </Label>
                <Input
                  id="cart-name"
                  className="h-10"
                  {...register("customerName")}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cart-notes">{copy.orderNotes}</Label>
                <Textarea
                  id="cart-notes"
                  rows={2}
                  placeholder={copy.orderNotesPlaceholder}
                  {...register("notes")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <span className="text-sm font-semibold text-muted-foreground">
                {copy.cartTotal}
              </span>
              <span
                className="font-heading text-xl font-bold text-[var(--menu-primary)]"
                dir="ltr"
              >
                {formatPrice(total, t.common.currency)}
              </span>
            </div>

            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 text-base font-bold transform-gpu text-white transition-transform duration-200 ease-smooth hover:scale-[1.01] active:scale-[0.99]"
              >
                <WhatsAppIcon className="size-5" />
                {copy.sendViaWhatsapp}
              </a>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => clear()}
              >
                {copy.clearCart}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
