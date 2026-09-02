"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * A filter select sized to sit beside the console's search field.
 *
 * `h-11!` carries the important flag for the same reason the governorate
 * picker does: SelectTrigger ships `data-[size=default]:h-8`, whose attribute
 * selector outranks a plain height class, so without it these render 32px tall
 * next to a 44px input.
 */
export function AdminSelect({
  value,
  onChange,
  items,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Record<string, string>;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)} items={items}>
      <SelectTrigger
        className="h-11! w-full gap-2 rounded-full pe-3.5 ps-4 text-sm"
        aria-label={label}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([id, text]) => (
          <SelectItem key={id} value={id}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
