import { cn } from "@/lib/utils";

/** Two-dot progress indicator for the phone → OTP hop shared by both login screens. */
export function AuthStepDots({ step }: { step: 0 | 1 }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {[0, 1].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-smooth",
            i === step ? "w-7 bg-primary" : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}
