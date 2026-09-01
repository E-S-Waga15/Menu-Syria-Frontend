"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth/store";
import {
  ALL_CATEGORIES,
  MenuCategoryBar,
} from "@/features/restaurant-dashboard/components/menu-category-bar";
import { MenuDishDialog } from "@/features/restaurant-dashboard/components/menu-dish-dialog";
import {
  MenuItemCard,
  MenuItemRow,
} from "@/features/restaurant-dashboard/components/menu-item-views";
import { MenuItemsToolbar } from "@/features/restaurant-dashboard/components/menu-items-toolbar";
import { getMyMenu } from "@/features/restaurant-dashboard/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "@/lib/toast";
import { useUiStore } from "@/stores/ui-store";
import type { MenuCategory, MenuItem } from "@/lib/types";

/**
 * The catalogue screen: sections on top, items below.
 *
 * This file is deliberately only wiring — state, the handlers that mutate it,
 * and the order the pieces appear in. The bar, the toolbar, the row/card and
 * the edit dialog each own their own markup, so a change to how an item looks
 * never means reading the reorder logic, and vice versa.
 */
export function MenuManager() {
  const { t } = useI18n();
  const businessType = useAuthStore(
    (s) => s.session?.businessType ?? "restaurant",
  );
  const isStore = businessType === "store";

  const { data } = useQuery({
    queryKey: queryKeys.restaurants.menu("r1"),
    queryFn: getMyMenu,
  });

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const view = useUiStore((s) => s.catalogView);
  const setView = useUiStore((s) => s.setCatalogView);

  // Seed the editable copy when the query resolves (adjust-state-during-render)
  const [seeded, setSeeded] = useState<typeof data | null>(null);
  if (data && data !== seeded) {
    setSeeded(data);
    setCategories(data.categories);
    setItems(data.items);
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

  const itemCountFor = (categoryId: string) =>
    items.filter((i) => i.categoryId === categoryId).length;

  const normalisedQuery = query.trim().toLowerCase();
  const visibleItems = items
    .filter(
      (i) =>
        activeCategory === ALL_CATEGORIES || i.categoryId === activeCategory,
    )
    .filter(
      (i) =>
        !normalisedQuery ||
        i.name.ar.toLowerCase().includes(normalisedQuery) ||
        i.name.en.toLowerCase().includes(normalisedQuery),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Order only means something inside one category and with nothing filtered
  // out — dragging row 3 above row 1 of a partial list would write a position
  // the user cannot see the consequences of.
  const canReorder = activeCategory !== ALL_CATEGORIES && !normalisedQuery;

  const toggleAvailability = (id: string, value: boolean) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: value } : i)),
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const onDropOn = (targetId: string) => {
    if (!dragId || dragId === targetId || !canReorder) return;
    setItems((prev) => {
      const inCategory = prev
        .filter((i) => i.categoryId === activeCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const ids = inCategory.map((i) => i.id);
      const from = ids.indexOf(dragId);
      const to = ids.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      const reordered = [...inCategory];
      const [moved] = reordered.splice(from, 1);
      if (moved) reordered.splice(to, 0, moved);
      const orderById = new Map(reordered.map((i, index) => [i.id, index]));
      return prev.map((i) =>
        orderById.has(i.id) ? { ...i, sortOrder: orderById.get(i.id)! } : i,
      );
    });
    setDragId(null);
  };

  const openEdit = (item: MenuItem | null) => {
    // Adding needs a home for the new item. On "All" there is no single
    // answer, so ask rather than guessing a category the user did not choose.
    if (!item && activeCategory === ALL_CATEGORIES) {
      toast.warning(t.dashboard.selectCategoryFirst);
      return;
    }
    setEditing(item);
    setDialogOpen(true);
  };

  // --- category CRUD ---
  const addCategory = (name: string) => {
    const id = `c${Date.now()}`;
    setCategories((prev) => [
      ...prev,
      {
        id,
        restaurantId: "r1",
        name: { ar: name, en: name },
        sortOrder: prev.length,
      },
    ]);
  };

  const renameCategory = (id: string, name: string) =>
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name: { ar: name, en: name } } : c,
      ),
    );

  const deleteCategory = (id: string) => {
    if (itemCountFor(id) > 0) {
      toast.error(t.dashboard.cannotDeleteCategory);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (activeCategory === id) setActiveCategory(ALL_CATEGORIES);
  };

  const reorderCategory = (id: string, direction: "up" | "down") =>
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = sorted.findIndex((c) => c.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= sorted.length)
        return prev;
      const a = sorted[index]!;
      const b = sorted[swapWith]!;
      return prev.map((c) =>
        c.id === a.id
          ? { ...c, sortOrder: b.sortOrder }
          : c.id === b.id
            ? { ...c, sortOrder: a.sortOrder }
            : c,
      );
    });

  const viewProps = (item: MenuItem) => ({
    item,
    draggable: canReorder,
    isDragging: dragId === item.id,
    onDragStart: () => setDragId(item.id),
    onDrop: () => onDropOn(item.id),
    onToggleAvailability: (value: boolean) =>
      toggleAvailability(item.id, value),
    onEdit: () => openEdit(item),
    onDelete: () => removeItem(item.id),
  });

  return (
    <div className="space-y-6">
      <MenuCategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        query={query}
        onQueryChange={setQuery}
        itemCountFor={itemCountFor}
        totalCount={items.length}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={deleteCategory}
        onReorderCategory={reorderCategory}
      />

      <section className="space-y-4 border-t border-border/60 pt-6">
        <MenuItemsToolbar
          count={visibleItems.length}
          view={view}
          onViewChange={setView}
          onAdd={() => openEdit(null)}
          isStore={isStore}
        />

        <p className="text-xs font-semibold text-muted-foreground">
          {canReorder
            ? t.dashboard.dragToReorder
            : t.dashboard.reorderInCategoryOnly}
        </p>

        {visibleItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            {t.dashboard.noItemsFound}
          </p>
        ) : view === "list" ? (
          <ul className="space-y-3">
            {visibleItems.map((item) => (
              <MenuItemRow key={item.id} {...viewProps(item)} />
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <MenuItemCard key={item.id} {...viewProps(item)} />
            ))}
          </div>
        )}
      </section>

      <MenuDishDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        isStore={isStore}
        onSave={(dish) => {
          // Mapped field by field, not spread: the dialog hands back
          // `nameText`/`descText`, which do not match `name`/`description` —
          // spreading them left the real fields untouched, so renaming an item
          // did nothing while quietly adding junk keys to it.
          const gallery = dish.images?.length ? dish.images : undefined;
          setItems((prev) =>
            editing
              ? prev.map((i) =>
                  i.id === editing.id
                    ? {
                        ...i,
                        name: {
                          ar: dish.nameText ?? "",
                          en: dish.nameText ?? "",
                        },
                        description: {
                          ar: dish.descText ?? "",
                          en: dish.descText ?? "",
                        },
                        price: dish.price ?? 0,
                        optionGroups: dish.optionGroups,
                        imageUrl: gallery?.[0] ?? i.imageUrl,
                        images: gallery,
                      }
                    : i,
                )
              : [
                  ...prev,
                  {
                    id: `m${Date.now()}`,
                    // openEdit guarantees a real category before we get here
                    categoryId: activeCategory,
                    restaurantId: "r1",
                    name: { ar: dish.nameText ?? "", en: dish.nameText ?? "" },
                    description: {
                      ar: dish.descText ?? "",
                      en: dish.descText ?? "",
                    },
                    price: dish.price ?? 0,
                    imageUrl:
                      gallery?.[0] ??
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    images: gallery,
                    optionGroups: dish.optionGroups,
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
