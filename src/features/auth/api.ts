/**
 * Auth API — typed wrappers around all auth endpoints.
 *
 * When IS_MOCK is true (NEXT_PUBLIC_API_URL is empty) every call resolves
 * from mock data so development still works without a running backend.
 */

import { apiFetch, IS_MOCK, mockDelay } from "@/lib/api/client";
import { lookupRolesByPhone } from "@/features/auth/mock-directory";
import type { UserRole, BusinessType } from "@/features/auth/store";

export type RegistrationRequestType = "restaurant" | "store" | "agent";

// ---------------------------------------------------------------------------
// Response shapes (mirror the backend DTOs)
// ---------------------------------------------------------------------------

export interface AuthUserSummary {
  id: string;
  email: string | null;
  name: string;
  frontendRole: UserRole;
  businessName: string | null;
  businessType: BusinessType | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserSummary;
}

export interface NewUserOtpResponse {
  isNewUser: true;
  signupToken: string;
  message: string;
}

export interface ExistingUserOtpResponse {
  isNewUser: false;
  accessToken: string;
  refreshToken: string;
  user: AuthUserSummary;
}

export type VerifyOtpResponse = NewUserOtpResponse | ExistingUserOtpResponse;

const normalizePhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/[\s+()-]/g, "");

export async function submitRegistrationRequest(input: {
  districtId: string;
  applicantName: string;
  phone: string;
  notes?: string;
  type: RegistrationRequestType;
  referralCode?: string;
}): Promise<{ id: string }> {
  return apiFetch("/registration-requests/public", {
    method: "POST",
    body: {
      ...input,
      phone: normalizePhoneNumber(input.phone),
    },
  });
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Request an OTP be sent to the given phone number. */
export async function requestOtp(
  phoneNumber: string,
): Promise<{ message: string }> {
  if (IS_MOCK) {
    return mockDelay({ message: "OTP sent (mock)" });
  }
  return apiFetch("/auth/otp/request", {
    method: "POST",
    body: { phoneNumber: normalizePhoneNumber(phoneNumber) },
  });
}

/** Verify the OTP. Returns either a signup token (new user) or full session (existing user). */
export async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<VerifyOtpResponse> {
  if (IS_MOCK) {
    // Reuse the mock directory: any known phone → existing user, unknown → new user
    const roles = lookupRolesByPhone(phoneNumber);
    if (roles.length > 0) {
      const r = roles[0];
      return mockDelay<ExistingUserOtpResponse>({
        isNewUser: false,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "mock-user-id",
          email: null,
          name: r.label,
          frontendRole: r.role,
          businessName: null,
          businessType: r.businessType ?? null,
        },
      });
    }
    return mockDelay<NewUserOtpResponse>({
      isNewUser: true,
      signupToken: "mock-signup-token",
      message: "New user — please complete your profile (mock)",
    });
  }
  return apiFetch("/auth/otp/verify", {
    method: "POST",
    body: { phoneNumber: normalizePhoneNumber(phoneNumber), code },
  });
}

/** Complete registration for a new user (phone-based). */
export async function registerWithOtp(
  signupToken: string,
  name: string,
  email?: string,
): Promise<AuthResponse> {
  if (IS_MOCK) {
    return mockDelay<AuthResponse>({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email: email ?? null,
        name,
        frontendRole: "user",
        businessName: null,
        businessType: null,
      },
    });
  }
  return apiFetch("/auth/otp/register", {
    method: "POST",
    body: { signupToken, name, email },
  });
}

/** Login with email + password. The backend resolves the role from the user
 * record — the client never picks one. */
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<AuthResponse> {
  if (IS_MOCK) {
    return mockDelay<AuthResponse>({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        email,
        name: email,
        frontendRole: "owner",
        businessName: null,
        businessType: "restaurant",
      },
    });
  }
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
