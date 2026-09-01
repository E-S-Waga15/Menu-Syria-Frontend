"use client";

import { LayoutGrid, List, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

import type { CatalogView } from "@/stores/ui-store";

/**
 * The item list's own header: what you are looking at, how many, how it is
 * laid out, and the one action that adds to it.
 */
export function MenuItemsToolbar({
  count,
  view,
  onViewChange,
  onAdd,
  isStore,
}: {
  count: number;
  view: CatalogView;
  onViewChange: (view: CatalogView) => void;
  onAdd: () => void;
  isStore: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        {isStore ? t.dashboard.myProducts : t.dashboard.myMenu}
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
          {count}
        </span>
      </h2>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 p-0.5">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={t.dashboard.viewList}
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={t.dashboard.viewGrid}
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>

        <Button onClick={onAdd}>
          <Plus className="size-4" />
          {isStore ? t.dashboard.addProduct : t.dashboard.addDish}
        </Button>
      </div>
    </div>
  );
}
