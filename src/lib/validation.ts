import { z } from "zod";

import type { Dictionary } from "@/i18n/get-dictionary";

/** The localized messages every schema factory receives. */
export type ValidationMessages = Dictionary["validation"];

/**
 * Syrian mobile number: 9 digits starting with 9, tolerant of spaces,
 * dashes, a leading 0, or the +963 country code.
 */
export const isSyrianPhone = (value: string): boolean => {
  const digits = value
    .replace(/[\s+-]/g, "")
    .replace(/^963/, "")
    .replace(/^0/, "");
  return /^9\d{8}$/.test(digits);
};

export const syrianPhone = (message: string) =>
  z.string().refine(isSyrianPhone, message);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An email field that is allowed to be left blank. */
export const optionalEmail = (message: string) =>
  z.string().refine((v) => v.trim() === "" || EMAIL_RE.test(v.trim()), message);
