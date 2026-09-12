import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "owner" | "agent" | "waiter" | "admin";
export type BusinessType = "restaurant" | "store";

interface Session {
  /** phone for OTP users, email for credentialed roles */
  identifier: string;
  role: UserRole;
  name: string;
  /** only meaningful for role "owner" — which dashboard wording/presets to use */
  businessType?: BusinessType;
  avatarUrl?: string;
}

interface AuthState {
  session: Session | null;
  /** JWT tokens issued by the backend */
  accessToken: string | null;
  refreshToken: string | null;
  /** phones that completed profile signup — OTP alone logs them straight in */
  knownPhones: string[];
  login: (session: Session) => void;
  /** Store tokens separately so they can be updated on refresh without touching session */
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  markKnown: (phone: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      accessToken: null,
      refreshToken: null,
      knownPhones: [],
      login: (session) => set({ session }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () => set({ session: null, accessToken: null, refreshToken: null }),
      markKnown: (phone) =>
        set((state) => ({
          knownPhones: state.knownPhones.includes(phone)
            ? state.knownPhones
            : [...state.knownPhones, phone],
        })),
    }),
    { name: "menu-syria-session" },
  ),
);
