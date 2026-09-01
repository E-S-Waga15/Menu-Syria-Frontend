import { z } from "zod";

import { isSyrianPhone } from "@/lib/validation";
import type { ValidationMessages } from "@/lib/validation";

/**
 * Checkout details — which fields are required depends on `fulfillment`:
 * dine-in only ever needs the (optional) table number, pickup needs a name
 * and a pickup-time slot, delivery needs a name, phone, and address.
 */
export const cartDetailsSchema = (v: ValidationMessages) =>
  z
    .object({
      fulfillment: z.enum(["dineIn", "pickup", "delivery"]),
      tableNumber: z.string().regex(/^\d*$/, v.numbersOnly),
      customerName: z.string(),
      pickupTime: z.enum(["asap", "15m", "30m", "1h"]).optional(),
      phone: z.string(),
      address: z.string(),
      notes: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.fulfillment === "pickup") {
        if (!data.customerName.trim())
          ctx.addIssue({
            code: "custom",
            path: ["customerName"],
            message: v.required,
          });
        if (!data.pickupTime)
          ctx.addIssue({
            code: "custom",
            path: ["pickupTime"],
            message: v.required,
          });
      }
      if (data.fulfillment === "delivery") {
        if (!data.customerName.trim())
          ctx.addIssue({
            code: "custom",
            path: ["customerName"],
            message: v.required,
          });
        if (!data.address.trim())
          ctx.addIssue({
            code: "custom",
            path: ["address"],
            message: v.required,
          });
        if (!isSyrianPhone(data.phone))
          ctx.addIssue({
            code: "custom",
            path: ["phone"],
            message: v.phoneInvalid,
          });
      }
    });
export type CartDetailsValues = z.infer<ReturnType<typeof cartDetailsSchema>>;
