import { z } from "zod";

import { syrianPhone, type ValidationMessages } from "@/lib/validation";

/**
 * Schema factories take the localized message pack so errors speak the
 * visitor's language. Types are inferred once and shared with the forms.
 */

export const phoneFormSchema = (v: ValidationMessages) =>
  z.object({ phone: syrianPhone(v.phoneInvalid) });
export type PhoneFormValues = z.infer<ReturnType<typeof phoneFormSchema>>;

export const otpFormSchema = (v: ValidationMessages) =>
  z.object({ otp: z.string().length(6, v.otpIncomplete) });
export type OtpFormValues = z.infer<ReturnType<typeof otpFormSchema>>;

export const credentialsSchema = (v: ValidationMessages) =>
  z.object({
    email: z.string().trim().min(1, v.required).email(v.emailInvalid),
    password: z.string().min(4, v.passwordMin),
  });
export type CredentialsValues = z.infer<ReturnType<typeof credentialsSchema>>;

export const adminLoginSchema = (v: ValidationMessages) =>
  z.object({
    email: z.string().trim().min(1, v.required).email(v.emailInvalid),
    password: z.string().min(1, v.required),
  });
export type AdminLoginValues = z.infer<ReturnType<typeof adminLoginSchema>>;

export const userProfileSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, v.nameMin),
    birthDate: z.string().min(1, v.birthDateRequired),
    gender: z.enum(["male", "female"]),
  });
export type UserProfileValues = z.infer<ReturnType<typeof userProfileSchema>>;

export const registerWizardSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(1, v.required),
    cuisine: z.string(),
    description: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    governorateId: z.string().min(1, v.governorateRequired),
    regionId: z.string().min(1, v.regionRequired),
    address: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    whatsapp: syrianPhone(v.phoneInvalid),
    instagram: z.string(),
    facebook: z.string(),
    referral: z.string(),
  });
export type RegisterWizardValues = z.infer<
  ReturnType<typeof registerWizardSchema>
>;

export const agentRegisterSchema = (v: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, v.nameMin),
    phone: syrianPhone(v.phoneInvalid),
    gender: z.enum(["male", "female"]),
    governorateId: z.string().min(1, v.governorateRequired),
    regionId: z.string().min(1, v.regionRequired),
    bio: z.string(),
    instagram: z.string(),
    facebook: z.string(),
  });
export type AgentRegisterValues = z.infer<
  ReturnType<typeof agentRegisterSchema>
>;
