"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("flex min-h-32 items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <motion.span
        aria-hidden
        className="size-5 rounded-full border-2 border-primary/20 border-t-primary border-s-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
