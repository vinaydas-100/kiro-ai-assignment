import { create } from 'zustand';

type Mode = 'light' | 'dark';

interface ThemeState {
  mode: Mode;
  toggleMode: () => void;
}

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  toggleMode: () =>
    set((state) => {
      const next: Mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') localStorage.setItem('theme-mode', next);
      return { mode: next };
    }),
}));

if (typeof window !== 'undefined') {
  useThemeStore.setState({ mode: getInitialMode() });
}
