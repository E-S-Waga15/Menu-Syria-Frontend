import { z } from "zod";

import { syrianPhone, type ValidationMessages } from "@/lib/validation";

/** The account page's forms, localized through the same message pack the auth
 * screens use. */

export const customerProfileSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, v.nameMin),
    /** Optional: an account created by phone has no address yet, and blank
     * means "leave whatever is on file alone". */
    email: z.union([z.literal(""), z.string().trim().email(v.emailInvalid)]),
  });
export type CustomerProfileValues = z.infer<
  ReturnType<typeof customerProfileSchema>
>;

export const customerPhoneSchema = (v: ValidationMessages) =>
  z.object({
    number: syrianPhone(v.phoneInvalid),
    numberType: z.enum(["mobile", "whatsapp", "landline"]),
  });
export type CustomerPhoneValues = z.infer<
  ReturnType<typeof customerPhoneSchema>
>;
