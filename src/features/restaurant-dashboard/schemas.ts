import { z } from "zod";

import type { ValidationMessages } from "@/lib/validation";

export const dishFormSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(1, v.required),
    desc: z.string(),
    price: z
      .string()
      .min(1, v.priceRequired)
      .regex(/^\d+$/, v.numbersOnly),
  });
export type DishFormValues = z.infer<ReturnType<typeof dishFormSchema>>;
