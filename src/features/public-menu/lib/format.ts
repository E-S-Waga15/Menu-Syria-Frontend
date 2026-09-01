import { fmt } from "@/i18n/fmt";
import type { Dictionary } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { lineUnitPrice, type CartLine } from "@/stores/cart-store";
import type { Business, FulfillmentMode } from "@/lib/types";

/**
 * The storefront label pack: the `menu` dictionary section for restaurants,
 * the `storeFront` section for e-commerce stores — same keys, different words.
 */
export type StorefrontCopy = Dictionary["menu"];

type PickupTime = "asap" | "15m" | "30m" | "1h";

const pickupTimeLabel: Record<PickupTime, keyof StorefrontCopy> = {
  asap: "pickupTimeAsap",
  "15m": "pickupTime15",
  "30m": "pickupTime30",
  "1h": "pickupTime60",
};

const fulfillmentLabel: Record<FulfillmentMode, keyof StorefrontCopy> = {
  dineIn: "fulfillmentDineIn",
  pickup: "fulfillmentPickup",
  delivery: "fulfillmentDelivery",
};

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
  fulfillment,
  tableNumber,
  customerName,
  pickupTime,
  phone,
  address,
  notes,
}: {
  business: Pick<Business, "name" | "whatsapp">;
  lines: CartLine[];
  lang: Locale;
  copy: StorefrontCopy;
  currency: string;
  total: number;
  fulfillment: FulfillmentMode;
  tableNumber?: string;
  customerName?: string;
  pickupTime?: PickupTime;
  phone?: string;
  address?: string;
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
    fmt(copy.whatsappFulfillment, {
      fulfillment: copy[fulfillmentLabel[fulfillment]],
    }),
  ];

  if (tableNumber) parts.push(fmt(copy.whatsappTable, { table: tableNumber }));
  if (customerName) parts.push(fmt(copy.whatsappName, { name: customerName }));
  if (pickupTime)
    parts.push(
      fmt(copy.whatsappPickupTime, { time: copy[pickupTimeLabel[pickupTime]] }),
    );
  if (phone) parts.push(fmt(copy.whatsappPhone, { phone }));
  if (address) parts.push(fmt(copy.whatsappAddress, { address }));
  if (notes) parts.push(fmt(copy.whatsappNotes, { notes }));

  const waPhone = business.whatsapp.replace(/[+\s]/g, "");
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(parts.join("\n"))}`;
}
