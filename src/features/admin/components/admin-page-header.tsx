import type { ReactNode } from "react";

/**
 * One heading shape for every console page: what you are looking at, how many
 * of them, and the page's single action opposite it.
 *
 * Shared rather than repeated so a new page cannot arrive with its own idea of
 * where the count or the action belongs.
 */
export function AdminPageHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-heading text-xl font-bold">
        {title}
        {count !== undefined && (
          <span className="ms-2 rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
            {count}
          </span>
        )}
      </h1>
      {action}
    </div>
  );
}
