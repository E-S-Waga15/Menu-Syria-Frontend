"use client";

import type { ReactNode } from "react";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";

/**
 * Search plus whatever selects a page needs, in the same panel every time.
 *
 * The clear action only appears once something is set, so the control does not
 * advertise work that is not there to be undone.
 */
export function AdminFilterBar({
  query,
  onQueryChange,
  placeholder,
  hasFilters,
  onClear,
  children,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  hasFilters: boolean;
  onClear: () => void;
  /** the page's own selects, laid out beside the search field */
  children?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label-eyebrow text-muted-foreground">
          {t.agentsPage.filtersLabel}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-berry-soft/40"
          >
            <X className="size-3.5" />
            {t.agentsPage.clearFilters}
          </button>
        )}
      </div>

      <div className="mt-3.5 grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-11 rounded-full ps-11"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
