"use client";

import { useState } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, useI18n } from "@/i18n/client";
import { toast } from "@/lib/toast";
import type { Governorate, Region } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Governorates and the regions inside them, as one master–detail panel.
 *
 * A region only means anything relative to its governorate, so the two are
 * edited together: pick a governorate on the left, work on its regions on the
 * right. Two separate flat lists would make the reader hold the relationship
 * in their head and make it possible to add a region to nothing.
 *
 * Edits stay local while the API is mocked, so the panel behaves like the real
 * thing without pretending a write landed on a server.
 */
export function PlacesManager({
  governorates: initialGovernorates,
  regions: initialRegions,
}: {
  governorates: Governorate[];
  regions: Region[];
}) {
  const { t, lang } = useI18n();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  const [governorates, setGovernorates] = useState(initialGovernorates);
  const [regions, setRegions] = useState(initialRegions);
  const [selectedId, setSelectedId] = useState(
    initialGovernorates[0]?.id ?? "",
  );

  const [newGovernorate, setNewGovernorate] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const selected = governorates.find((g) => g.id === selectedId);
  const regionsOf = (id: string) =>
    regions.filter((r) => r.governorateId === id);
  const selectedRegions = selected ? regionsOf(selected.id) : [];

  const addGovernorate = () => {
    const name = newGovernorate.trim();
    if (!name) return;
    const id = `g${Date.now()}`;
    setGovernorates((prev) => [...prev, { id, name: { ar: name, en: name } }]);
    setNewGovernorate("");
    setSelectedId(id);
    toast.success(t.admin.saved);
  };

  const deleteGovernorate = (id: string) => {
    // deleting a parent would orphan its children, so it is blocked with a
    // reason rather than silently cascading
    if (regionsOf(id).length > 0) {
      toast.error(t.admin.cannotDeleteGovernorate);
      return;
    }
    setGovernorates((prev) => prev.filter((g) => g.id !== id));
    if (selectedId === id) setSelectedId(governorates[0]?.id ?? "");
    toast.success(t.admin.saved);
  };

  const addRegion = () => {
    const name = newRegion.trim();
    if (!name || !selected) return;
    setRegions((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        governorateId: selected.id,
        name: { ar: name, en: name },
      },
    ]);
    setNewRegion("");
    toast.success(t.admin.saved);
  };

  const startRename = (region: Region) => {
    setRenamingId(region.id);
    setRenameValue(region.name[lang]);
  };

  const commitRename = () => {
    const name = renameValue.trim();
    if (renamingId && name) {
      setRegions((prev) =>
        prev.map((r) =>
          r.id === renamingId ? { ...r, name: { ar: name, en: name } } : r,
        ),
      );
      toast.success(t.admin.saved);
    }
    setRenamingId(null);
  };

  const deleteRegion = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
    toast.success(t.admin.saved);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr]">
      {/* master */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="font-heading text-sm font-bold">
          {t.admin.governorates}
        </h3>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder={t.admin.governorateName}
            className="h-10"
            value={newGovernorate}
            onChange={(e) => setNewGovernorate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGovernorate()}
          />
          <Button
            className="h-10 shrink-0"
            aria-label={t.admin.addGovernorate}
            onClick={addGovernorate}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <ul className="scrollbar-none mt-3 max-h-96 space-y-1.5 overflow-y-auto">
          {governorates.map((gov) => {
            const count = regionsOf(gov.id).length;
            const active = gov.id === selectedId;
            return (
              <li key={gov.id}>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-xl border px-1.5 transition-colors",
                    active
                      ? "border-primary bg-berry-soft/30 dark:bg-berry-soft/50"
                      : "border-border/60 hover:border-primary/35",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(gov.id)}
                    aria-current={active ? "true" : undefined}
                    className="flex min-h-10 flex-1 cursor-pointer items-center gap-2 px-2 text-start text-sm font-semibold"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {gov.name[lang]}
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-container px-1.5 text-xs text-muted-foreground tabular-nums">
                      {count}
                    </span>
                    <Chevron className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t.common.delete}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteGovernorate(gov.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* detail */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        {!selected ? (
          <p className="flex min-h-40 items-center justify-center gap-2.5 text-center text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {t.admin.selectGovernorate}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-sm font-bold">
                {fmt(t.admin.regionsOf, { name: selected.name[lang] })}
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                {fmt(t.admin.regionCount, { count: selectedRegions.length })}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                placeholder={t.admin.regionName}
                className="h-10"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRegion()}
              />
              <Button
                className="h-10 shrink-0"
                aria-label={t.admin.addRegion}
                onClick={addRegion}
              >
                <Plus className="size-4" />
                {t.common.add}
              </Button>
            </div>

            {selectedRegions.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {t.admin.noRegions}
              </p>
            ) : (
              <ul className="scrollbar-none mt-3 grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">
                {selectedRegions.map((region) => (
                  <li
                    key={region.id}
                    className="flex items-center gap-1 rounded-xl border border-border/60 px-1.5 py-1"
                  >
                    {renamingId === region.id ? (
                      <>
                        <Input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="h-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t.common.save}
                          className="shrink-0 text-success"
                          onClick={commitRename}
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t.common.cancel}
                          className="shrink-0 text-muted-foreground"
                          onClick={() => setRenamingId(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate px-2 text-sm font-semibold">
                          {region.name[lang]}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t.admin.renameRecord}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => startRename(region)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t.common.delete}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteRegion(region.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
