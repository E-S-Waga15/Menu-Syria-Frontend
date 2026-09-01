import { cn } from "@/lib/utils";

/**
 * Section marker for the About page: a short saffron rule ahead of the label.
 *
 * The rule is the logo's own accent — the one saffron bar among the mark's
 * three menu lines — pulled out and reused as the page's structural device.
 * It is the only warm note per section, which is what keeps it readable as a
 * signal rather than decoration.
 */
export function AboutEyebrow({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  /** `inverse` on the berry band, where the label sits on white text */
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <p className={cn("flex items-center gap-3", className)}>
      <span className="h-0.5 w-7 shrink-0 bg-zest" aria-hidden />
      <span
        className={cn(
          "label-eyebrow",
          tone === "inverse" ? "text-white/70" : "text-primary",
        )}
      >
        {children}
      </span>
    </p>
  );
}
