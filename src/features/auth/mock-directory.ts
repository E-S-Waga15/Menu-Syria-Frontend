import type { BusinessType, UserRole } from "@/features/auth/store";

export interface PhoneRole {
  role: Exclude<UserRole, "admin">;
  label: string;
  /** only set when role is "owner" */
  businessType?: BusinessType;
}

const normalize = (phone: string) =>
  phone
    .replace(/[\s+-]/g, "")
    .replace(/^963/, "")
    .replace(/^0/, "");

/**
 * Stand-in for a backend "which roles does this phone hold" lookup. Seeded
 * with a few demo numbers, including one multi-role number so the account
 * chooser modal is reachable without a real backend, and one store-owner
 * number so the store-flavored dashboard is demoable too.
 */
const directory: Record<string, PhoneRole[]> = {
  "944111222": [
    { role: "owner", label: "مطعم الياسمين", businessType: "restaurant" },
  ],
  "966555777": [
    { role: "owner", label: "متجر خيوط الشام", businessType: "store" },
  ],
  "955222333": [{ role: "agent", label: "وكيل دمشق" }],
  "933444555": [{ role: "waiter", label: "غرسون — مطعم الياسمين" }],
  "911222333": [{ role: "user", label: "حسابك الشخصي" }],
  "922333444": [
    { role: "owner", label: "مطعم الياسمين", businessType: "restaurant" },
    { role: "user", label: "حسابك الشخصي" },
  ],
};

export function lookupRolesByPhone(phone: string): PhoneRole[] {
  return directory[normalize(phone)] ?? [];
}
