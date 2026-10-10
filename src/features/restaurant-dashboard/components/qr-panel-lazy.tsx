"use client";

import dynamic from "next/dynamic";

import { LoadingSpinner } from "@/components/shared/loading-spinner";

/** QR canvas rendering is client-only anyway — split it out of the shell. */
export const QrPanelLazy = dynamic(
  () => import("./qr-panel").then((m) => m.QrPanel),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  },
);
