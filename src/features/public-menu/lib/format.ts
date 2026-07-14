import { fmt } from "@/i18n/fmt";
import type { Dictionary } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { lineUnitPrice, type CartLine } from "@/stores/cart-store";
import type { Restaurant } from "@/lib/types";

export function formatPrice(price: number, currency: string): string {
  return `${price.toLocaleString("en-US")} ${currency}`;
}

/** Builds the pre-formatted WhatsApp order message and returns a wa.me URL. */
export function buildWhatsAppOrderUrl({
  restaurant,
  lines,
  lang,
  t,
  total,
  tableNumber,
  customerName,
  notes,
}: {
  restaurant: Restaurant;
  lines: CartLine[];
  lang: Locale;
  t: Dictionary;
  total: number;
  tableNumber?: string;
  customerName?: string;
  notes?: string;
}): string {
  const parts: string[] = [
    fmt(t.menu.whatsappGreeting, { restaurant: restaurant.name[lang] }),
    "",
    ...lines.map((line) => {
      const options =
        line.options.length > 0
          ? ` (${line.options.map((o) => o.name[lang]).join("، ")})`
          : "";
      return `• ${line.quantity}× ${line.item.name[lang]}${options} — ${formatPrice(
        lineUnitPrice(line) * line.quantity,
        t.common.currency,
      )}`;
    }),
    "",
    fmt(t.menu.whatsappTotal, {
      total: formatPrice(total, t.common.currency),
    }),
  ];

  if (tableNumber)
    parts.push(fmt(t.menu.whatsappTable, { table: tableNumber }));
  if (customerName)
    parts.push(fmt(t.menu.whatsappName, { name: customerName }));
  if (notes) parts.push(fmt(t.menu.whatsappNotes, { notes }));

  const phone = restaurant.whatsapp.replace(/[+\s]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(parts.join("\n"))}`;
}
