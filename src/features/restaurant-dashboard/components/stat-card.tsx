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
    <div className="rounded-2xl border border-border/60 bg-card p-3.5 md:p-4">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-1.5 font-heading text-lg font-bold tracking-tight md:text-2xl"
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
            "flex size-9 shrink-0 items-center justify-center rounded-xl md:size-10",
            accent === "berry" && "bg-berry-soft text-berry-soft-foreground",
            accent === "zest" && "bg-zest-soft text-zest-soft-foreground",
            accent === "neutral" && "bg-surface-container text-foreground/70",
          )}
        >
          <Icon className="size-4.5 md:size-5" strokeWidth={1.7} />
        </span>
      </div>
    </div>
  );
}
