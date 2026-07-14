import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "restaurant" | "agent" | "admin";

interface Session {
  phone: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    { name: "menu-syria-session" },
  ),
);
