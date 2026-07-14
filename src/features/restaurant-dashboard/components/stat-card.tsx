"use client";

import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "berry",
  hint,
}: {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: "berry" | "zest" | "neutral";
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-2 font-heading text-2xl font-bold tracking-tight md:text-3xl"
            dir="ltr"
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs font-semibold text-success">{hint}</p>
          )}
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent === "berry" && "bg-berry-soft text-berry-soft-foreground",
            accent === "zest" && "bg-zest-soft text-zest-soft-foreground",
            accent === "neutral" && "bg-surface-container text-foreground/70",
          )}
        >
          <Icon className="size-5.5" strokeWidth={1.7} />
        </span>
      </div>
    </div>
  );
}
