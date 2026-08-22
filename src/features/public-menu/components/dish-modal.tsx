"use client";

import Image from "next/image";
import { useState } from "react";

import { Check, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, type StorefrontCopy } from "@/features/public-menu/lib/format";
import { useI18n } from "@/i18n/client";
import type { CatalogItem, MenuItemOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export function DishModal({
  item,
  businessId,
  copy,
  onClose,
}: {
  item: CatalogItem | null;
  businessId: string;
  copy: StorefrontCopy;
  onClose: () => void;
}) {
  const { t, lang, dir } = useI18n();
  const addItem = useCartStore((s) => s.addItem);

  const [selected, setSelected] = useState<MenuItemOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Reset selections whenever a different dish opens (during render, no effect)
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (item && item.id !== seededFor) {
    setSeededFor(item.id);
    setSelected([]);
    setQuantity(1);
  }

  if (!item) return null;

  const images = item.images?.length ? item.images : [item.imageUrl];
  const unitPrice =
    item.price + selected.reduce((sum, o) => sum + o.priceDelta, 0);

  const toggleOption = (option: MenuItemOption) =>
    setSelected((prev) =>
      prev.some((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option],
    );

  const badgeLabel =
    item.badge === "popular"
      ? copy.popular
      : item.badge === "new"
        ? copy.new
        : item.badge === "chefSpecial"
          ? copy.chefSpecial
          : null;

  const addToCart = () => {
    addItem(businessId, item, selected, quantity);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-hidden overflow-y-auto p-0 sm:max-w-md">
        {/* image slider */}
        <div className="relative">
          <Carousel opts={{ loop: images.length > 1 }} dir="ltr">
            <CarouselContent className="ms-0">
              {images.map((src, index) => (
                <CarouselItem key={src} className="relative ps-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={src}
                      alt={item.name[lang]}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, 28rem"
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="start-3 border-0 bg-white/80 backdrop-blur dark:bg-black/50" />
                <CarouselNext className="end-3 border-0 bg-white/80 backdrop-blur dark:bg-black/50" />
              </>
            )}
          </Carousel>
          {badgeLabel && (
            <span className="absolute start-3 top-3 rounded-full bg-zest px-3 py-1 text-xs font-bold text-zest-foreground">
              {badgeLabel}
            </span>
          )}
        </div>

        <div className="space-y-5 p-5" dir={dir}>
          <div>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="font-heading text-xl font-bold">
                {item.name[lang]}
              </DialogTitle>
              <p
                className="shrink-0 text-lg font-bold text-[var(--menu-primary)]"
                dir="ltr"
              >
                {formatPrice(item.price, t.common.currency)}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description[lang]}
            </p>
          </div>

          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h3 className="label-eyebrow text-muted-foreground">
                {copy.ingredients}
              </h3>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.en}
                    className="rounded-full bg-zest-soft px-3 py-1 text-xs font-semibold text-zest-soft-foreground"
                  >
                    {ingredient[lang]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.options && item.options.length > 0 && (
            <div>
              <h3 className="label-eyebrow text-muted-foreground">
                {copy.options}
              </h3>
              <ul className="mt-2.5 space-y-2">
                {item.options.map((option) => {
                  const isChecked = selected.some((o) => o.id === option.id);
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => toggleOption(option)}
                        aria-pressed={isChecked}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                          isChecked
                            ? "border-[var(--menu-primary)] bg-[var(--menu-primary)]/5"
                            : "border-border hover:border-[var(--menu-primary)]/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                            isChecked
                              ? "border-[var(--menu-primary)] bg-[var(--menu-primary)] text-white"
                              : "border-border",
                          )}
                        >
                          {isChecked && <Check className="size-3.5" />}
                        </span>
                        <span className="flex-1 text-start">
                          {option.name[lang]}
                        </span>
                        <span
                          className="shrink-0 text-xs font-bold text-[var(--menu-primary)]"
                          dir="ltr"
                        >
                          +{formatPrice(option.priceDelta, t.common.currency)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* quantity + add */}
          <div className="flex items-center gap-3 border-t border-border/60 pt-4">
            <div
              className="flex items-center gap-1 rounded-full bg-surface-container p-1"
              aria-label={copy.quantity}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="-"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-6 text-center text-sm font-bold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="+"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <button
              type="button"
              disabled={!item.isAvailable}
              onClick={addToCart}
              className="flex h-12 flex-1 items-center justify-between gap-2 rounded-full bg-[var(--menu-primary)] px-5 text-sm font-bold transform-gpu text-white transition-transform duration-200 ease-smooth hover:scale-[1.01] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <span>{copy.addToCart}</span>
              <span dir="ltr">
                {formatPrice(unitPrice * quantity, t.common.currency)}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
