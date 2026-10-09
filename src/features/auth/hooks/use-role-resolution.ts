"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/lib/toast";

import { destinationForRole } from "@/features/auth/lib/destinations";
import type { PhoneRole } from "@/features/auth/mock-directory";
import { useAuthStore } from "@/features/auth/store";
import { fmt, useI18n } from "@/i18n/client";
import type { AuthUserSummary } from "@/features/auth/api";
import { useNavigationLoading } from "@/providers/navigation-loading";

export type ResolveResult = "none" | "routed" | "choose";

/**
 * The "smart routing" step: given a verified phone number, look up which
 * role(s) it holds and either log straight in (one role), surface a
 * chooser (several roles), or report nothing found — shared by the
 * business and customer login screens so both go through the same logic.
 */
export function useRoleResolution() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setTokens = useAuthStore((s) => s.setTokens);
  const { start: startNavigating } = useNavigationLoading();

  const [modalRoles, setModalRoles] = useState<PhoneRole[] | null>(null);
  const [phone, setPhone] = useState("");

  const finish = (fullPhone: string, picked: PhoneRole) => {
    login({
      identifier: fullPhone,
      role: picked.role,
      name: picked.label,
      businessType: picked.businessType,
    });
    toast.success(fmt(t.auth.welcomeBack, { name: picked.label }));
    startNavigating();
    router.push(destinationForRole(lang, picked.role));
    setModalRoles(null);
  };

  /**
   * Called after a successful backend OTP verify / credentials login.
   * Stores tokens + session and routes the user to the right dashboard.
   */
  const finishFromBackend = (
    accessToken: string,
    refreshToken: string,
    user: AuthUserSummary,
    fullPhone?: string,
  ) => {
    setTokens(accessToken, refreshToken);
    login({
      identifier: fullPhone ?? user.email ?? String(user.id),
      role: user.frontendRole,
      name: user.name,
      businessType: user.businessType ?? undefined,
    });
    toast.success(fmt(t.auth.welcomeBack, { name: user.name }));
    startNavigating();
    router.push(destinationForRole(lang, user.frontendRole));
    setModalRoles(null);
  };

  /** Branch on an explicit roles list — lets a caller merge in roles from
   * another source (e.g. the customer flow's `knownPhones` flag) before
   * resolving. */
  const resolveRoles = (
    fullPhone: string,
    roles: PhoneRole[],
  ): ResolveResult => {
    if (roles.length === 0) return "none";
    if (roles.length === 1) {
      finish(fullPhone, roles[0]);
      return "routed";
    }
    setPhone(fullPhone);
    setModalRoles(roles);
    return "choose";
  };

  return {
    resolveRoles,
    finishFromBackend,
    modalRoles,
    phone,
    selectRole: (picked: PhoneRole) => finish(phone, picked),
    closeModal: () => setModalRoles(null),
  };
}
