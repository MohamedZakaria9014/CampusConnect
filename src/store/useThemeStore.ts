import { create } from 'zustand';
import { COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof COLORS.dark;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark', // Sleek dark mode default for premium startup look
  colors: COLORS.dark,
  toggleTheme: () => {
    const nextMode = get().mode === 'dark' ? 'light' : 'dark';
    set({
      mode: nextMode,
      colors: COLORS[nextMode],
    });
  },
  setTheme: (mode: ThemeMode) => {
    set({
      mode,
      colors: COLORS[mode],
    });
  },
}));
