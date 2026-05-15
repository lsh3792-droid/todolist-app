import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: CurrentUser | null;
  setAuth: (accessToken: string, refreshToken: string, user: CurrentUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, currentUser: user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, currentUser: null }),
    }),
    {
      name: 'auth',
    },
  ),
);
