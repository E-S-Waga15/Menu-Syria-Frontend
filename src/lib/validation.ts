import { z } from "zod";

import type { Dictionary } from "@/i18n/get-dictionary";

/** The localized messages every schema factory receives. */
export type ValidationMessages = Dictionary["validation"];

/**
 * Syrian mobile number: 9 digits starting with 9, tolerant of spaces,
 * dashes, a leading 0, or the +963 country code.
 */
export const syrianPhone = (message: string) =>
  z.string().refine((value) => {
    const digits = value
      .replace(/[\s+-]/g, "")
      .replace(/^963/, "")
      .replace(/^0/, "");
    return /^9\d{8}$/.test(digits);
  }, message);
