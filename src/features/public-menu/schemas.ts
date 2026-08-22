import { z } from "zod";

import type { ValidationMessages } from "@/lib/validation";

/** Checkout details — everything optional, but table number must be numeric. */
export const cartDetailsSchema = (v: ValidationMessages) =>
  z.object({
    tableNumber: z.string().regex(/^\d*$/, v.numbersOnly),
    customerName: z.string(),
    notes: z.string(),
  });
export type CartDetailsValues = z.infer<ReturnType<typeof cartDetailsSchema>>;
