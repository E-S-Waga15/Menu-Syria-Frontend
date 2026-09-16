"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/shared/field-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  dishFormSchema,
  type DishFormValues,
} from "@/features/restaurant-dashboard/schemas";
import { useI18n } from "@/i18n/client";
import { uploadImage } from "@/lib/api/upload";
import type {
  CatalogOptionGroup,
  MenuItem,
  OptionSelectionType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Create/edit panel for a single menu item, lifted out of MenuManager so the
 * manager reads as layout and the form reads as a form. It owns nothing but
 * the draft: the parent decides what saving means.
 */
export function MenuDishDialog({
  open,
  onOpenChange,
  editing,
  isStore,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MenuItem | null;
  isStore: boolean;
  onSave: (dish: {
    nameText?: string;
    descText?: string;
    price?: number;
    optionGroups?: CatalogOptionGroup[];
    /** gallery, first entry first — the parent maps [0] onto imageUrl */
    images?: string[];
  }) => void;
}) {
  const { t, lang } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema(t.validation)),
    defaultValues: { name: "", desc: "", price: "" },
    mode: "onTouched",
  });

  const [groups, setGroups] = useState<CatalogOptionGroup[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Re-seed the fields whenever a different dish is opened (during render, no effect)
  const [seededFor, setSeededFor] = useState<{
    editing: MenuItem | null;
    open: boolean;
  } | null>(null);
  if (seededFor?.editing !== editing || seededFor?.open !== open) {
    setSeededFor({ editing, open });
    reset({
      name: editing?.name[lang] ?? "",
      desc: editing?.description[lang] ?? "",
      price: editing ? String(editing.price) : "",
    });
    setGroups(editing?.optionGroups ?? []);
    // an older item may only have the single imageUrl; treat it as a gallery
    // of one so editing never silently drops it
    setImages(
      editing ? (editing.images ?? [editing.imageUrl]).filter(Boolean) : [],
    );
  }

  const submit = (values: DishFormValues) =>
    onSave({
      nameText: values.name,
      descText: values.desc,
      price: Number(values.price) || 0,
      optionGroups: groups,
      images,
    });

  const addGroup = (preset: "size" | "color" | "custom") => {
    const presetName =
      preset === "size"
        ? { ar: "القياس", en: "Size" }
        : preset === "color"
          ? { ar: "اللون", en: "Color" }
          : { ar: "", en: "" };
    setGroups((prev) => [
      ...prev,
      {
        id: `og${Date.now()}`,
        name: presetName,
        selectionType: preset === "custom" ? "multiple" : "single",
        required: preset !== "custom",
        options: [],
      },
    ]);
  };

  const updateGroup = (id: string, patch: Partial<CatalogOptionGroup>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const addOption = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
            ...g,
            options: [
              ...g.options,
              {
                id: `opt${Date.now()}`,
                name: { ar: "", en: "" },
                priceDelta: 0,
              },
            ],
          }
          : g,
      ),
    );
  };

  const updateOption = (
    groupId: string,
    optionId: string,
    patch: { name?: string; priceDelta?: number },
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
            ...g,
            options: g.options.map((o) =>
              o.id === optionId
                ? {
                  ...o,
                  name:
                    patch.name !== undefined
                      ? { ar: patch.name, en: patch.name }
                      : o.name,
                  priceDelta: patch.priceDelta ?? o.priceDelta,
                }
                : o,
            ),
          },
      ),
    );
  };

  const removeOption = (groupId: string, optionId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
          : g,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto scrollbar-none">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t.common.edit
              : isStore
                ? t.dashboard.addProduct
                : t.dashboard.addDish}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-1.5">
              <Label htmlFor="dish-name">
                {isStore ? t.dashboard.productName : t.dashboard.dishName}
              </Label>
              <Input
                id="dish-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dish-price">{t.dashboard.dishPrice}</Label>
              <Input
                id="dish-price"
                inputMode="numeric"
                dir="ltr"
                aria-invalid={!!errors.price}
                {...register("price")}
              />
              <FieldError message={errors.price?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dish-desc">{t.dashboard.dishDesc}</Label>
              <Textarea id="dish-desc" rows={2} {...register("desc")} />
            </div>
            <div className="space-y-1.5">
              <Label>
                {isStore ? t.dashboard.productImage : t.dashboard.dishImage}
              </Label>

              {images.length > 0 && (
                <ul className="grid grid-cols-3 gap-2">
                  {images.map((src, index) => (
                    <li
                      key={src}
                      className="group/img relative aspect-square overflow-hidden rounded-xl border border-border/60"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element --
                          object URLs from the picker are not remote patterns
                          next/image can resolve */}
                      <img
                        src={src}
                        alt=""
                        className="size-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-bold text-white">
                          {t.dashboard.mainImage}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={t.dashboard.removeImage}
                        onClick={() =>
                          setImages((prev) => prev.filter((s) => s !== src))
                        }
                        className="absolute end-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <FileDropzone
                label={t.dashboard.addPhoto}
                hint={t.dashboard.imagesHint}
                onFile={async (file) => {
                  if (!file) return;
                  const { url } = await uploadImage(file, "items");
                  setImages((prev) => [...prev, url]);
                }}
              />
            </div>

            {/* option groups */}
            <div className="space-y-3 border-t border-border/60 pt-4">
              <Label>{t.dashboard.itemOptions}</Label>

              {groups.map((group) => (
                <div
                  key={group.id}
                  className="space-y-3 rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={group.name[lang]}
                      onChange={(e) =>
                        updateGroup(group.id, {
                          name: { ar: e.target.value, en: e.target.value },
                        })
                      }
                      placeholder={t.dashboard.optionGroupName}
                      className="h-9 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.common.delete}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeGroup(group.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 rounded-lg border border-border/60 p-0.5">
                      {(["single", "multiple"] as OptionSelectionType[]).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              updateGroup(group.id, { selectionType: type })
                            }
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                              group.selectionType === type
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {type === "single"
                              ? t.dashboard.selectionSingle
                              : t.dashboard.selectionMultiple}
                          </button>
                        ),
                      )}
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Checkbox
                        checked={group.required}
                        onCheckedChange={(v) =>
                          updateGroup(group.id, { required: v === true })
                        }
                      />
                      {t.dashboard.optionRequired}
                    </label>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input
                          value={option.name[lang]}
                          onChange={(e) =>
                            updateOption(group.id, option.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder={t.dashboard.optionName}
                          className="h-8 flex-1"
                        />
                        <Input
                          type="number"
                          dir="ltr"
                          value={option.priceDelta}
                          onChange={(e) =>
                            updateOption(group.id, option.id, {
                              priceDelta: Number(e.target.value) || 0,
                            })
                          }
                          placeholder={t.dashboard.optionPriceDelta}
                          className="h-8 w-24"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t.common.delete}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeOption(group.id, option.id)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => addOption(group.id)}
                    >
                      <Plus className="size-3.5" />
                      {t.dashboard.addOption}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addGroup("size")}
                >
                  <Plus className="size-3.5" />
                  {t.dashboard.presetSize}
                </Button>
                {isStore && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addGroup("color")}
                  >
                    <Plus className="size-3.5" />
                    {t.dashboard.presetColor}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addGroup("custom")}
                >
                  <Plus className="size-3.5" />
                  {t.dashboard.addOptionGroup}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="px-4 pb-4">
            <Button type="submit" className="w-full shadow-glow">
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
