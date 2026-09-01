"use client";

import { useState } from "react";

import { ArrowDown, ArrowUp, Plus, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import type { MenuCategory } from "@/lib/types";

/**
 * Category CRUD for the dashboard's catalog manager — create, rename,
 * reorder, and delete (blocked while the category still holds items, so
 * nothing disappears silently).
 */
export function CategoryManager({
  labelled = false,
  categories,
  itemCountFor,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: {
  /** show the action as a full labelled button (beside a section heading)
   * rather than the icon-only trigger used inside a crowded toolbar */
  labelled?: boolean;
  categories: MenuCategory[];
  itemCountFor: (categoryId: string) => number;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}) {
  const { t, lang } = useI18n();
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const submitAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName("");
  };

  const startRename = (category: MenuCategory) => {
    setRenamingId(category.id);
    setRenameValue(category.name[lang]);
  };

  const submitRename = () => {
    const name = renameValue.trim();
    if (renamingId && name) onRename(renamingId, name);
    setRenamingId(null);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size={labelled ? "default" : "icon"}
            aria-label={t.dashboard.manageCategories}
          />
        }
      >
        <Settings2 className="size-4" />
        {labelled && t.dashboard.manageCategories}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.dashboard.manageCategories}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 px-4">
          {sorted.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t.dashboard.noCategories}
            </p>
          )}
          {sorted.map((category, index) => {
            const count = itemCountFor(category.id);
            return (
              <div
                key={category.id}
                className="flex items-center gap-1.5 rounded-xl border border-border/60 p-2"
              >
                {renamingId === category.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitRename()}
                    onBlur={submitRename}
                    className="h-8 flex-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startRename(category)}
                    className="flex-1 truncate rounded-lg px-2 py-1 text-start text-sm font-semibold hover:bg-accent"
                  >
                    {category.name[lang]}
                  </button>
                )}

                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  aria-label={t.dashboard.moveUp}
                  onClick={() => onReorder(category.id, "up")}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === sorted.length - 1}
                  aria-label={t.dashboard.moveDown}
                  onClick={() => onReorder(category.id, "down")}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={count > 0}
                  title={
                    count > 0 ? t.dashboard.cannotDeleteCategory : undefined
                  }
                  aria-label={t.common.delete}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-4 pb-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            placeholder={t.dashboard.categoryName}
            className="h-10 flex-1"
          />
          <Button
            type="button"
            size="icon"
            aria-label={t.dashboard.addCategory}
            onClick={submitAdd}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
