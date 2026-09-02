"use client";

import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { CatalogView } from "@/stores/ui-store";

/** cards or rows, in the same control the catalogue manager uses */
export function AdminViewToggle({
  view,
  onChange,
}: {
  view: CatalogView;
  onChange: (view: CatalogView) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 p-0.5">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label={t.dashboard.viewGrid}
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label={t.dashboard.viewList}
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
      </Button>
    </div>
  );
}
