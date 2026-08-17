import { create } from "zustand";

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
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hydrate: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    isAuthenticated: false,
    setAuth: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
    updateUser: (updates) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    hydrate: (user) => set({ user, isAuthenticated: !!user }),
  })
);

export function isAdmin(role?: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function isCounsellorOrAbove(role?: UserRole): boolean {
  return role === "counsellor" || role === "admin" || role === "super_admin";
}