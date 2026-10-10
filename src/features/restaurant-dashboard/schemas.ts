import { z } from "zod";

import { syrianPhone, type ValidationMessages } from "@/lib/validation";

export const dishFormSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(1, v.required),
    desc: z.string(),
    price: z
      .string()
      .min(1, v.priceRequired)
      .regex(/^\d+$/, v.numbersOnly),
    currency: z.enum(["SYP", "USD"]),
  });
export type DishFormValues = z.infer<ReturnType<typeof dishFormSchema>>;

export const branchFormSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(1, v.required),
    governorateId: z.string().min(1, v.governorateRequired),
    districtId: z.string().min(1, v.regionRequired),
    address: z.string(),
    phone: syrianPhone(v.phoneInvalid),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  });
export type BranchFormValues = z.infer<ReturnType<typeof branchFormSchema>>;
