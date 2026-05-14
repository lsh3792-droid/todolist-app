import { create } from 'zustand';
import i18n from '../i18n';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export type Theme = 'dark' | 'light';
export type Language = 'ko' | 'en';

type UiState = {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
};

const savedTheme = (localStorage.getItem('theme') as Theme) ?? 'dark';
document.documentElement.dataset.theme = savedTheme;

const savedLanguage = (localStorage.getItem('language') as Language) ?? 'ko';

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  theme: savedTheme,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      document.documentElement.dataset.theme = next;
      return { theme: next };
    }),
  language: savedLanguage,
  setLanguage: (lang) =>
    set(() => {
      localStorage.setItem('language', lang);
      i18n.changeLanguage(lang);
      return { language: lang };
    }),
}));
