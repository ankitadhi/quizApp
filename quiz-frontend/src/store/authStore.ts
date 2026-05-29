import { create } from "zustand";
import Cookies from "js-cookie";
import { authAPI } from "../api/endpoints";
import type { User } from "../api/endpoints";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: !!Cookies.get("access_token"),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { access, refresh } = response.data;

      Cookies.set("access_token", access, { expires: 7 });
      Cookies.set("refresh_token", refresh, { expires: 30 });

      set({ isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Login failed. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  signup: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.signup(email, username, password);
      const tokens = response.data?.tokens || response.data;
      const access = tokens?.access || response.data?.access;
      const refresh = tokens?.refresh || response.data?.refresh;

      if (access && refresh) {
        Cookies.set("access_token", access, { expires: 7 });
        Cookies.set("refresh_token", refresh, { expires: 30 });
        set({ isAuthenticated: true });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Signup failed. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    const refresh = Cookies.get("refresh_token");
    authAPI.logout(refresh);
    set({ user: null, isAuthenticated: false });
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Update failed. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
