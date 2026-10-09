"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * A color field that pairs a native color wheel (for picking visually) with a
 * free-text input so a value in any CSS format the visitor types — a hex
 * code, `rgb(...)`, or a named color — is accepted as-is. The swatch button
 * always reflects whatever is currently typed, valid or not, since the
 * browser itself drops a color it can't render.
 */
export function ColorField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2.5">
        <label
          className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border/60 transition-transform duration-200 ease-smooth hover:scale-105"
          style={{ backgroundColor: value || undefined }}
        >
          <input
            type="color"
            value={HEX.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <input
          id={id}
          type="text"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#850036"
          className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
    </div>
  );
}
