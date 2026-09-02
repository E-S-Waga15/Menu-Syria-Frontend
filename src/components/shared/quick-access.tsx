import Link from "next/link";

import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

/** one destination on the grid */
export interface QuickAccessItem {
  href: string;
  label: string;
  /** the one line that says what the reader will find there */
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * The launcher grid every dashboard opens with.
 *
 * Two to a row on a phone, stacked as tiles — the icon reads first and the
 * label under it, which is how a launcher grid is scanned. From `sm` there is
 * room to lay each one on its side again.
 *
 * The chip colours are pinned rather than tokenised: this tile appears on the
 * admin, business and agent dashboards, and the berry-soft token re-tones in
 * dark mode, which made the same grid look like two different components
 * depending on the theme.
 */
export function QuickAccess({
  title,
  items,
}: {
  /** omit where the surrounding page already provides the heading */
  title?: string;
  items: QuickAccessItem[];
}) {
  return (
    <section>
      {title && <h2 className="font-heading text-lg font-bold">{title}</h2>}
      <ul
        className={cn(
          "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",
          title && "mt-4",
        )}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex h-full transform-gpu flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-[border-color,translate] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-primary/35 sm:flex-row sm:items-start sm:gap-3.5 sm:p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ffd9de] text-[#90003b] transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold transition-colors group-hover:text-primary">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {item.hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
