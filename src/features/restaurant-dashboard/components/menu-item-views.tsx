"use client";

import Image from "next/image";

import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/features/public-menu/lib/format";
import { useI18n } from "@/i18n/client";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** everything a row or card needs; the parent owns the data and the actions */
export interface MenuItemViewProps {
  item: MenuItem;
  /** false while the list is filtered — order is only meaningful in one
   * category, so the handle is hidden rather than lying about what it does */
  draggable: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onToggleAvailability: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** shared drag wiring, so the row and the card cannot drift apart */
function dragProps(p: MenuItemViewProps) {
  return p.draggable
    ? {
        draggable: true,
        onDragStart: p.onDragStart,
        onDragOver: (e: React.DragEvent) => e.preventDefault(),
        onDrop: p.onDrop,
      }
    : {};
}

export function MenuItemRow(props: MenuItemViewProps) {
  const { t, lang } = useI18n();
  const { item } = props;

  return (
    <li
      {...dragProps(props)}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-[translate,scale,border-color,opacity] duration-200 ease-smooth",
        props.isDragging && "opacity-50 ring-2 ring-primary/40",
      )}
    >
      {props.draggable && (
        <GripVertical className="size-4.5 shrink-0 cursor-grab text-muted-foreground/50" />
      )}
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
        <p className="mt-0.5 text-sm font-semibold text-primary">
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
            onCheckedChange={props.onToggleAvailability}
            className="data-[checked]:bg-success"
          />
        </label>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.common.edit}
          onClick={props.onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.common.delete}
          className="text-muted-foreground hover:text-destructive"
          onClick={props.onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}

export function MenuItemCard(props: MenuItemViewProps) {
  const { t, lang } = useI18n();
  const { item } = props;

  return (
    <div
      {...dragProps(props)}
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card transition-[translate,scale,border-color,opacity] duration-200 ease-smooth",
        props.isDragging && "opacity-50 ring-2 ring-primary/40",
      )}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className={cn("object-cover", !item.isAvailable && "grayscale")}
        />
        {props.draggable && (
          <GripVertical className="absolute start-2 top-2 size-4 shrink-0 cursor-grab text-white" />
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold">{item.name[lang]}</p>
        <p className="mt-0.5 text-sm font-semibold text-primary">
          {formatPrice(item.price, t.common.currency)}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <Switch
            checked={item.isAvailable}
            onCheckedChange={props.onToggleAvailability}
            className="data-[checked]:bg-success"
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.common.edit}
              onClick={props.onEdit}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t.common.delete}
              className="text-muted-foreground hover:text-destructive"
              onClick={props.onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
