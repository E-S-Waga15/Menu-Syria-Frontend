"use client";

import type { ReactNode } from "react";

import { MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onSelect?: () => void;
  /** rendered as a link instead of a button when set */
  render?: ReactNode;
  /** puts a rule above it and tints it — for the one destructive entry */
  danger?: boolean;
}

/**
 * The three-dot menu used on every row and card that has per-item actions —
 * the admin console, the business dashboard's offers, and anything after them.
 *
 * One component so the trigger, the width and the position of a destructive
 * entry are the same everywhere; a menu that changes shape per page makes the
 * product feel like several products.
 */
export function RowActions({
  actions,
  triggerClassName,
}: {
  actions: RowAction[];
  /** override the trigger's skin — e.g. the glass chip used over a photo */
  triggerClassName?: string;
}) {
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.common.actions}
        className={cn(
          // size lives in the default half so an override can replace it
          "flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          !triggerClassName?.includes("size-") && "size-9",
          triggerClassName ??
            "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
        {actions.map((action) => (
          <div key={action.label}>
            {action.danger && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onSelect}
              render={action.render as never}
              className={cn(
                action.danger &&
                  "text-destructive focus:bg-destructive/10 focus:text-destructive",
              )}
            >
              <action.icon className="size-4" />
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
