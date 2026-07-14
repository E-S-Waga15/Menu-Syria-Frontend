"use client";

import Image from "next/image";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { formatPrice } from "@/features/public-menu/lib/format";
import { getMyMenu } from "@/features/restaurant-dashboard/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MenuManager() {
  const { t, lang } = useI18n();

  const { data } = useQuery({
    queryKey: queryKeys.restaurants.menu("r1"),
    queryFn: getMyMenu,
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  // Seed the editable copy when the query resolves (adjust-state-during-render pattern)
  const [seeded, setSeeded] = useState<typeof data | null>(null);
  if (data && data !== seeded) {
    setSeeded(data);
    setItems(data.items);
    if (activeCategory === null)
      setActiveCategory(data.categories[0]?.id ?? null);
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96 max-w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  const visibleItems = items
    .filter((i) => i.categoryId === activeCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const toggleAvailability = (id: string, value: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: value } : i)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(t.common.done);
  };

  const onDropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setItems((prev) => {
      const inCategory = prev
        .filter((i) => i.categoryId === activeCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const ids = inCategory.map((i) => i.id);
      const from = ids.indexOf(dragId);
      const to = ids.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      ids.splice(to, 0, ids.splice(from, 1)[0]!);
      const orderMap = new Map(ids.map((id, index) => [id, index + 1]));
      return prev.map((i) =>
        orderMap.has(i.id) ? { ...i, sortOrder: orderMap.get(i.id)! } : i,
      );
    });
    setDragId(null);
  };

  const openEdit = (item: MenuItem | null) => {
    setEditing(item);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={activeCategory ?? undefined}
          onValueChange={(v) => setActiveCategory(v as string)}
        >
          <TabsList className="h-auto flex-wrap rounded-xl p-1">
            {data.categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="rounded-lg px-4 py-1.5 font-semibold"
              >
                {category.name[lang]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button className="shadow-glow" onClick={() => openEdit(null)}>
          <Plus className="size-4" />
          {t.dashboard.addDish}
        </Button>
      </div>

      <p className="text-xs font-semibold text-muted-foreground">
        {t.dashboard.dragToReorder}
      </p>

      <ul className="space-y-3">
        {visibleItems.map((item) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOn(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-[translate,scale,border-color,opacity] duration-200 ease-smooth",
              dragId === item.id && "opacity-50 ring-2 ring-primary/40",
            )}
          >
            <GripVertical className="size-4.5 shrink-0 cursor-grab text-muted-foreground/50" />
            <Image
              src={item.imageUrl}
              alt=""
              width={56}
              height={56}
              className={cn(
                "size-14 shrink-0 rounded-xl object-cover",
                !item.isAvailable && "grayscale",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{item.name[lang]}</p>
              <p className="mt-0.5 text-sm font-semibold text-primary" dir="ltr">
                {formatPrice(item.price, t.common.currency)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
              <label className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-muted-foreground md:block">
                  {item.isAvailable ? t.common.available : t.common.unavailable}
                </span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={(v) => toggleAvailability(item.id, v)}
                  className="data-[checked]:bg-success"
                />
              </label>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.common.edit}
                onClick={() => openEdit(item)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.common.delete}
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <DishDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={(dish) => {
          setItems((prev) =>
            editing
              ? prev.map((i) => (i.id === editing.id ? { ...i, ...dish } : i))
              : [
                  ...prev,
                  {
                    id: `m${Date.now()}`,
                    categoryId: activeCategory ?? "c1",
                    restaurantId: "r1",
                    name: { ar: dish.nameText ?? "", en: dish.nameText ?? "" },
                    description: {
                      ar: dish.descText ?? "",
                      en: dish.descText ?? "",
                    },
                    price: dish.price ?? 0,
                    imageUrl:
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    isAvailable: true,
                    sortOrder: 999,
                  },
                ],
          );
          setDialogOpen(false);
          toast.success(t.common.done);
        }}
      />
    </div>
  );
}

function DishDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MenuItem | null;
  onSave: (dish: {
    nameText?: string;
    descText?: string;
    price?: number;
  }) => void;
}) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  // Re-seed the fields whenever a different dish is opened (during render, no effect)
  const [seededFor, setSeededFor] = useState<{
    editing: MenuItem | null;
    open: boolean;
  } | null>(null);
  if (seededFor?.editing !== editing || seededFor?.open !== open) {
    setSeededFor({ editing, open });
    setName(editing?.name[lang] ?? "");
    setDesc(editing?.description[lang] ?? "");
    setPrice(editing ? String(editing.price) : "");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? t.common.edit : t.dashboard.addDish}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-4 pb-2">
          <div className="space-y-1.5">
            <Label htmlFor="dish-name">{t.dashboard.dishName}</Label>
            <Input
              id="dish-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dish-price">{t.dashboard.dishPrice}</Label>
            <Input
              id="dish-price"
              inputMode="numeric"
              dir="ltr"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dish-desc">{t.dashboard.dishDesc}</Label>
            <Textarea
              id="dish-desc"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.dashboard.dishImage}</Label>
            <FileDropzone label={t.dashboard.dishImage} />
          </div>
        </div>
        <DialogFooter className="px-4 pb-4">
          <Button
            className="w-full shadow-glow"
            disabled={!name.trim()}
            onClick={() =>
              onSave({
                nameText: name,
                descText: desc,
                price: Number(price) || 0,
              })
            }
          >
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
