"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Recharts is the heaviest client dependency in the app — loading it as
 * its own chunk keeps every other dashboard page light.
 */
export const AnalyticsViewLazy = dynamic(
  () => import("./analytics-view").then((m) => m.AnalyticsView),
  { ssr: false, loading: () => <AnalyticsSkeleton /> },
);
