import { fmt } from "@/i18n/fmt";
import type { Dictionary } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { lineUnitPrice, type CartLine } from "@/stores/cart-store";
import type { Business } from "@/lib/types";

/**
 * The storefront label pack: the `menu` dictionary section for restaurants,
 * the `storeFront` section for e-commerce stores — same keys, different words.
 */
export type StorefrontCopy = Dictionary["menu"];

export function formatPrice(price: number, currency: string): string {
  return `${price.toLocaleString("en-US")} ${currency}`;
}

/** Builds the pre-formatted WhatsApp order message and returns a wa.me URL. */
export function buildWhatsAppOrderUrl({
  business,
  lines,
  lang,
  copy,
  currency,
  total,
  tableNumber,
  customerName,
  notes,
}: {
  business: Pick<Business, "name" | "whatsapp">;
  lines: CartLine[];
  lang: Locale;
  copy: StorefrontCopy;
  currency: string;
  total: number;
  tableNumber?: string;
  customerName?: string;
  notes?: string;
}): string {
  const parts: string[] = [
    fmt(copy.whatsappGreeting, { restaurant: business.name[lang] }),
    "",
    ...lines.map((line) => {
      const options =
        line.options.length > 0
          ? ` (${line.options.map((o) => o.name[lang]).join("، ")})`
          : "";
      return `• ${line.quantity}× ${line.item.name[lang]}${options} — ${formatPrice(
        lineUnitPrice(line) * line.quantity,
        currency,
      )}`;
    }),
    "",
    fmt(copy.whatsappTotal, { total: formatPrice(total, currency) }),
  ];

  if (tableNumber) parts.push(fmt(copy.whatsappTable, { table: tableNumber }));
  if (customerName) parts.push(fmt(copy.whatsappName, { name: customerName }));
  if (notes) parts.push(fmt(copy.whatsappNotes, { notes }));

  const phone = business.whatsapp.replace(/[+\s]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(parts.join("\n"))}`;
}
