import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "student" | "counsellor" | "admin" | "super_admin";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  board: string;
  class: string;
  role: UserRole;
  schoolName?: string;
  city?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token: token || null, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      getToken: () => get().token,
    }),
    {
      name: "career-guru-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function isAdmin(role?: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function isCounsellorOrAbove(role?: UserRole): boolean {
  return role === "counsellor" || role === "admin" || role === "super_admin";
}
