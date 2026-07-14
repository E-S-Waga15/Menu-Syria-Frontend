"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Info, MapPin, Phone, Search, Star } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  CartSheet,
  FloatingCartBar,
} from "@/features/public-menu/components/cart";
import { DishCard } from "@/features/public-menu/components/dish-card";
import { DishModal } from "@/features/public-menu/components/dish-modal";
import type { PublicMenu } from "@/features/public-menu/services";
import { useI18n } from "@/i18n/client";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export function MenuScreen({ menu }: { menu: PublicMenu }) {
  const { t, lang } = useI18n();
  const { restaurant, categories, items, governorateName, regionName } = menu;
  const addItem = useCartStore((s) => s.addItem);

  const [search, setSearch] = useState("");
  const [compact, setCompact] = useState(false);
  const [openedDish, setOpenedDish] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // Suspends the scroll-spy while a pill click drives a smooth scroll
  const spySuspended = useRef(false);
  const spyResumeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = Object.values(sectionRefs.current).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (spySuspended.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveCategory(visible.target.id.replace("cat-", ""));
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories, search]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    spySuspended.current = true;
    if (spyResumeTimer.current !== null)
      window.clearTimeout(spyResumeTimer.current);
    spyResumeTimer.current = window.setTimeout(() => {
      spySuspended.current = false;
    }, 900);
    sectionRefs.current[categoryId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const query = search.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      query === ""
        ? items
        : items.filter(
            (item) =>
              item.name.ar.toLowerCase().includes(query) ||
              item.name.en.toLowerCase().includes(query) ||
              item.description.ar.toLowerCase().includes(query) ||
              item.description.en.toLowerCase().includes(query),
          ),
    [items, query],
  );

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filteredItems) {
      const list = map.get(item.categoryId) ?? [];
      list.push(item);
      map.set(item.categoryId, list);
    }
    for (const list of map.values())
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [filteredItems]);

  const handleAdd = (item: MenuItem) => addItem(restaurant.id, item);

  return (
    <div
      className="min-h-dvh bg-background"
      style={
        {
          "--menu-primary": restaurant.theme.primaryColor,
          "--menu-secondary": restaurant.theme.secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* shrinking header */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4">
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-300 ease-smooth",
              compact ? "max-h-0 opacity-0" : "max-h-44 opacity-100",
            )}
          >
            {/* identity row */}
            <div className="flex items-center gap-3.5 pt-3">
              <Image
                src={restaurant.logoUrl}
                alt=""
                width={72}
                height={72}
                className="size-16 rounded-2xl border-2 border-[var(--menu-primary)]/20 object-cover md:size-18"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-lg font-bold md:text-xl">
                  {restaurant.name[lang]}
                </h1>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="size-3 fill-zest text-zest" />
                  {restaurant.rating} · {restaurant.cuisine[lang]}
                </p>
                {/* the details page lives inside the menu route — the only
                    destination a QR visitor can reach, with no site chrome */}
                <Link
                  href={`/${lang}/menu/${restaurant.slug}/about`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--menu-primary)] hover:underline"
                >
                  <Info className="size-3.5" />
                  {t.menu.viewRestaurantDetails}
                </Link>
              </div>
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            {/* location + phone + call */}
            <div className="scrollbar-none -mx-4 mt-2.5 flex items-center gap-x-4 gap-y-1 overflow-x-auto px-4 pb-1 text-xs font-semibold text-muted-foreground">
              <span className="flex shrink-0 items-center gap-1.5">
                <MapPin className="size-3.5 text-[var(--menu-primary)]" />
                {governorateName[lang]}
                {lang === "ar" ? "، " : ", "}
                {regionName[lang]}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <Phone className="size-3.5 text-[var(--menu-primary)]" />
                <span dir="ltr">{restaurant.phone}</span>
              </span>
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                className="ms-auto flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--menu-primary)]/10 px-3.5 py-1.5 font-bold text-[var(--menu-primary)] transition-colors duration-200 hover:bg-[var(--menu-primary)]/20"
              >
                <Phone className="size-3.5" />
                {t.restaurant.call}
              </a>
            </div>
          </div>

          <div className={cn("pb-3", compact ? "pt-3" : "pt-1")}>
            <div className="relative">
              <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.menu.searchPlaceholder}
                className="h-11 w-full rounded-full border border-border/70 bg-surface-container-low ps-11 pe-4 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-[var(--menu-primary)] focus:ring-2 focus:ring-[var(--menu-primary)]/25"
              />
            </div>
          </div>

          {/* categories pills */}
          {query === "" && (
            <nav
              aria-label={t.dashboard.categories}
              className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-3"
            >
              {categories.map((category) => {
                const isActive = category.id === activeCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => scrollToCategory(category.id)}
                    className={cn(
                      "shrink-0 transform-gpu rounded-full px-4.5 py-2 text-sm font-semibold transition-[background-color,color,translate,scale] duration-300 ease-smooth",
                      isActive
                        ? "bg-[var(--menu-primary)] text-white"
                        : "bg-surface-container text-foreground/70 hover:bg-surface-container-high",
                    )}
                  >
                    {category.name[lang]}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* content */}
      <main
        className={cn(
          "mx-auto max-w-5xl px-4 pb-32 transition-[padding]",
          compact ? "pt-32" : "pt-60",
          query !== "" && (compact ? "pt-28" : "pt-56"),
        )}
      >
        {query !== "" ? (
          <section>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <DishCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  onOpen={setOpenedDish}
                />
              ))}
            </div>
            {filteredItems.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">
                {t.menu.emptyCartBody}
              </p>
            )}
          </section>
        ) : (
          categories.map((category) => {
            const categoryItems = itemsByCategory.get(category.id) ?? [];
            if (categoryItems.length === 0) return null;
            return (
              <section
                key={category.id}
                id={`cat-${category.id}`}
                ref={(el) => {
                  sectionRefs.current[category.id] = el;
                }}
                className="scroll-mt-44 pt-8 first:pt-2"
              >
                <h2 className="font-heading text-xl font-bold">
                  {category.name[lang]}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                  {categoryItems.map((item) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      onAdd={handleAdd}
                      onOpen={setOpenedDish}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <FloatingCartBar />
      <CartSheet restaurant={restaurant} />
      <DishModal
        item={openedDish}
        restaurantId={restaurant.id}
        onClose={() => setOpenedDish(null)}
      />
    </div>
  );
}
