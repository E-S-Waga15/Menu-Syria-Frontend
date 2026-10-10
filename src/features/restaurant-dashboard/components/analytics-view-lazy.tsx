"use client";

import dynamic from "next/dynamic";

import { LoadingSpinner } from "@/components/shared/loading-spinner";

/**
 * Recharts is the heaviest client dependency in the app — loading it as
 * its own chunk keeps every other dashboard page light.
 */
export const AnalyticsViewLazy = dynamic(
  () => import("./analytics-view").then((m) => m.AnalyticsView),
  { ssr: false, loading: () => <LoadingSpinner /> },
);
