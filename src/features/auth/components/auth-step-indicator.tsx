import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Numbered 3-step progress (phone → OTP → profile) for the customer auth
 * journey — shown across the two screens that make up the flow (the phone
 * and OTP steps live on one route, the profile-completion step on another),
 * so the user still reads it as one continuous 3-step process.
 */
export function AuthStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="mx-auto mb-6 flex max-w-[14rem] items-center">
      {[1, 2, 3].map((num) => (
        <li key={num} className={cn("flex items-center", num > 1 && "flex-1")}>
          {num > 1 && (
            <span
              className={cn(
                "mx-1.5 h-0.5 flex-1 rounded-full transition-colors duration-500",
                num <= step ? "bg-primary" : "bg-border",
              )}
            />
          )}
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
              num < step
                ? "bg-primary text-primary-foreground"
                : num === step
                  ? "bg-primary text-primary-foreground shadow-glow scale-110"
                  : // dark mode swaps the flat fill for a glass chip: the
                    // literal shadow value stands in for `shadow-lg
                    // shadow-black/20`, whose token is zeroed in globals.css
                    "bg-surface-container text-muted-foreground dark:border dark:border-white/18 dark:bg-white/5 dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-4px_rgba(0,0,0,0.2)] dark:backdrop-blur-md",
            )}
          >
            {num < step ? <Check className="size-3.5" /> : num}
          </span>
        </li>
      ))}
    </ol>
  );
}
