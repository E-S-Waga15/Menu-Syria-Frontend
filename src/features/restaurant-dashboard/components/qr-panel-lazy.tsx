"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/** QR canvas rendering is client-only anyway — split it out of the shell. */
export const QrPanelLazy = dynamic(
  () => import("./qr-panel").then((m) => m.QrPanel),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    ),
  },
);
