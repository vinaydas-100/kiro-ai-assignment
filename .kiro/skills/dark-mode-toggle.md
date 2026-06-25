---
name: Dark Mode Toggle
description: Add a persistent light/dark mode toggle using Zustand 5 + MUI v9 colorSchemes, with localStorage persistence and OS preference fallback
inclusion: manual
---

# Dark Mode Toggle Skill

When asked to add a dark/light mode toggle to a Next.js + MUI v9 + Zustand project, follow this pattern exactly.

---

## Overview

- Zustand store is the single source of truth for `mode`
- MUI theme is derived from `mode` inside a Client Component (`AppShell`)
- `localStorage` read/write is always guarded by `typeof window !== 'undefined'` — SSR-safe and test-safe
- `layout.tsx` stays a Server Component; the `'use client'` boundary lives in `AppShell`
- MUI v9 `colorSchemes` API embeds both palettes in one theme object

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/store/themeStore.ts` | Create |
| `src/components/ThemeToggle.tsx` | Create |
| `src/components/AppShell.tsx` | Create |
| `src/app/layout.tsx` | Update — swap `ThemeProvider` for `AppShell` |
| `src/store/themeStore.test.ts` | Create |
| `src/components/ThemeToggle.test.tsx` | Create |
| `package.json` | Add `@mui/icons-material@^9.0.0` to dependencies |

---

## Dependency

Add to `dependencies` in `package.json`:

```json
"@mui/icons-material": "^9.0.0"
```

Run `pnpm install` after adding.

---

## Implementation

### 1. `src/store/themeStore.ts`

```typescript
import { create } from 'zustand';

type Mode = 'light' | 'dark';

interface ThemeState {
  mode: Mode;
  toggleMode: () => void;
}

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light'; // SSR-safe default
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light', // static initialiser — hydrated on first client render
  toggleMode: () =>
    set((state) => {
      const next: Mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') localStorage.setItem('theme-mode', next);
      return { mode: next };
    }),
}));

// Hydrate from localStorage / OS preference — runs only in browser
if (typeof window !== 'undefined') {
  useThemeStore.setState({ mode: getInitialMode() });
}
```

Key rules:
- Static `'light'` initialiser prevents SSR/client hydration mismatch
- Module-level hydration block runs only in browser, before first render
- `toggleMode` persists to `localStorage` under key `"theme-mode"`

---

### 2. `src/components/ThemeToggle.tsx`

```tsx
'use client';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  return (
    <IconButton onClick={toggleMode} aria-label="toggle dark mode" color="inherit">
      {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}
```

Rules:
- `aria-label="toggle dark mode"` — required for accessibility
- `DarkModeIcon` (moon) shown in light mode; `LightModeIcon` (sun) shown in dark mode
- No system props — all MUI v9 compliant

---

### 3. `src/components/AppShell.tsx`

```tsx
'use client';
import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import { useThemeStore } from '@/store/themeStore';
import ThemeToggle from './ThemeToggle';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  const theme = useMemo(
    () =>
      createTheme({
        typography: { fontFamily: 'var(--font-roboto)' },
        cssVariables: true,
        colorSchemes: { light: true, dark: true },
        defaultColorScheme: mode,
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
        }}
      />
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
        <ThemeToggle />
      </Box>
      {children}
    </ThemeProvider>
  );
}
```

Rules:
- `useMemo` — only recreates the theme when `mode` changes, not on every render
- `colorSchemes: { light: true, dark: true }` — MUI v9 API, both palettes in one theme
- `defaultColorScheme: mode` — switches the active palette (do NOT use deprecated `palette.mode`)
- `CssBaseline` resets browser styles; `GlobalStyles` syncs `body` background to the active palette
- Toggle button is fixed top-right at `zIndex: 1300` (above MUI Drawers/AppBars)

---

### 4. `src/app/layout.tsx` (update)

Remove any existing `ThemeProvider` and `theme` imports. Replace with `AppShell`:

```tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import AppShell from '@/components/AppShell';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Your App',
  description: 'Your description',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <AppShell>{children}</AppShell>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

- No `'use client'` on `layout.tsx` — it stays a Server Component
- `AppRouterCacheProvider` wraps `AppShell` (not the other way around)

---

## Tests

### `src/store/themeStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useThemeStore } from '@/store/themeStore';

// Feature: dark-mode-toggle, Property T1: toggleMode parity
describe('useThemeStore', () => {
  beforeEach(() => useThemeStore.setState({ mode: 'light' }));

  it('Property T1: toggleMode n times from light — even→light, odd→dark', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 200 }), (n) => {
        useThemeStore.setState({ mode: 'light' });
        for (let i = 0; i < n; i++) useThemeStore.getState().toggleMode();
        const expected = n % 2 === 0 ? 'light' : 'dark';
        expect(useThemeStore.getState().mode).toBe(expected);
      })
    );
  });
});
```

### `src/components/ThemeToggle.test.tsx`

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/store/themeStore';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => useThemeStore.setState({ mode: 'light' }));

  it('renders a button with accessible label', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i })
    ).toBeInTheDocument();
  });

  it('clicking the button toggles mode from light to dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('shows an SVG icon in both modes', () => {
    const { container, rerender } = render(<ThemeToggle />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    useThemeStore.setState({ mode: 'dark' });
    rerender(<ThemeToggle />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
```

---

## Correctness Property

**Property T1 — toggleMode parity:**
For any non-negative integer `n`, calling `toggleMode` exactly `n` times from `mode = 'light'`:
- `n` even → `mode === 'light'`
- `n` odd → `mode === 'dark'`

---

## Verification Checklist

After implementing:

1. `pnpm install` — installs `@mui/icons-material`
2. `pnpm typecheck` — zero TypeScript errors
3. `pnpm test` — all tests pass, exit code 0
4. Open browser → toggle persists on reload (check `localStorage["theme-mode"]`)
5. Delete `localStorage["theme-mode"]` → OS dark preference is respected
