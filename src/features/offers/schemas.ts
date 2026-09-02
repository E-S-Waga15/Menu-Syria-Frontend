import { z } from "zod";

import type { ValidationMessages } from "@/lib/validation";

/**
 * The offer form's contract.
 *
 * Prices are kept as strings because that is what a numeric `<input>` gives
 * back — coercing here rather than in the component means the empty field and
 * "0" stay distinguishable all the way to validation.
 */
export const offerSchema = (v: ValidationMessages) =>
  z
    .object({
      name: z.string().trim().min(1, v.required),
      description: z.string().trim(),
      originalPrice: z.string().trim(),
      price: z
        .string()
        .trim()
        .min(1, v.priceRequired)
        .refine((raw) => Number(raw) > 0, v.priceRequired),
      startsAt: z.string().min(1, v.required),
      endsAt: z.string(),
      isActive: z.boolean(),
      badge: z.enum(["none", "limited", "bestValue", "new"]),
      includes: z.array(z.string()),
      images: z.array(z.string()),
    })
    // the struck-through price only means anything if it is the higher one;
    // the error lands on `price` because that is the field the owner is
    // most likely to be getting wrong
    .refine(
      (values) =>
        values.originalPrice === "" ||
        Number(values.originalPrice) === 0 ||
        Number(values.originalPrice) > Number(values.price),
      { message: v.offerPriceTooHigh, path: ["price"] },
    );

export type OfferValues = z.infer<ReturnType<typeof offerSchema>>;
