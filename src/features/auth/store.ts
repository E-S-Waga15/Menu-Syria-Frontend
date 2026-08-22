import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "owner" | "agent" | "waiter" | "admin";

interface Session {
  /** phone for OTP users, email for credentialed roles */
  identifier: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  session: Session | null;
  /** phones that completed profile signup — OTP alone logs them straight in */
  knownPhones: string[];
  login: (session: Session) => void;
  logout: () => void;
  markKnown: (phone: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      knownPhones: [],
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
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
