# Design Document: Dark Mode Theme Toggle

## Overview

This skill adds a persistent light/dark mode toggle to the HelloWorld Next.js project. It builds directly on the existing MUI v9 `ThemeProvider`, `cssVariables: true` theme, and Zustand 5 store pattern already present in the codebase.

**Key design decisions:**
- The Zustand store is the single source of truth for `mode`; MUI's theme is derived from it.
- `localStorage` read/write is fully guarded behind `typeof window !== 'undefined'` checks so the store is SSR-safe and test-safe.
- The `ThemeProvider` must live in a Client Component because it reads Zustand state — a new `AppShell` component carries that `'use client'` boundary, keeping `layout.tsx` a pure Server Component.
- MUI v9's `colorSchemes` API is used so both palettes are embedded in one theme object; only `defaultColorScheme` is swapped at runtime.

---

## Architecture

```
src/app/layout.tsx  (Server Component)
  └─ AppRouterCacheProvider
       └─ AppShell  (Client Component — 'use client')
            ├─ ThemeProvider  (theme built from useThemeStore().mode)
            │    ├─ Box (top-right toggle bar)
            │    │    └─ ThemeToggle
            │    └─ {children}  (page.tsx etc.)
            └─ reads useThemeStore
```

```
src/store/themeStore.ts     ← Zustand store: mode + toggleMode
src/components/AppShell.tsx ← 'use client', ThemeProvider + layout chrome
src/components/ThemeToggle.tsx ← 'use client', IconButton sun/moon
```

---

## Components and Interfaces

### `src/store/themeStore.ts`

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
  mode: 'light', // safe static initialiser — hydrated on first client render
  toggleMode: () =>
    set((state) => {
      const next: Mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') localStorage.setItem('theme-mode', next);
      return { mode: next };
    }),
}));

// Hydrate from localStorage / OS preference on the client after mount
if (typeof window !== 'undefined') {
  useThemeStore.setState({ mode: getInitialMode() });
}
```

> The static `'light'` initialiser avoids SSR/client mismatch. The `if (typeof window !== 'undefined')` block at module level runs only in the browser and hydrates the store immediately before the first render.

### `src/components/AppShell.tsx` (Client Component)

```tsx
'use client';
import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1300,
        }}
      >
        <ThemeToggle />
      </Box>
      {children}
    </ThemeProvider>
  );
}
```

> `useMemo` ensures the theme object is only recreated when `mode` actually changes, not on every render.

### `src/components/ThemeToggle.tsx` (Client Component)

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

### `src/app/layout.tsx` (updated)

```tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import AppShell from '@/components/AppShell';

const roboto = Roboto({ ... });

export const metadata: Metadata = { ... };

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

> `ThemeProvider` moves from `layout.tsx` into `AppShell`. `layout.tsx` stays a Server Component.

---

## Data Models

### ThemeState (Zustand)

```typescript
type Mode = 'light' | 'dark';

interface ThemeState {
  mode: Mode;          // current colour scheme
  toggleMode: () => void; // flips mode and persists to localStorage
}
```

---

## Correctness Properties

### Property 1: toggleMode parity
For any non-negative integer `n`, calling `toggleMode` exactly `n` times from `mode = 'light'`:
- If `n` is **even** → `mode === 'light'`
- If `n` is **odd** → `mode === 'dark'`

**Validates: Requirements 1.4, 1.5**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` unavailable (SSR, private browsing) | All access guarded by `typeof window !== 'undefined'`; store falls back to `'light'` |
| `localStorage` contains unexpected value | Treated as absent; OS preference used as fallback |
| `@mui/icons-material` import fails (missing dep) | `pnpm install` step catches this; TypeScript will also error at build |

---

## Testing Strategy

### `src/store/themeStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useThemeStore } from '@/store/themeStore';

// Feature: dark-mode-theme-toggle, Property 1: toggleMode parity
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

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { useThemeStore } from '@/store/themeStore';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders a button with accessible label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
  });

  it('shows moon icon in light mode', () => {
    useThemeStore.setState({ mode: 'light' });
    const { container } = render(<ThemeToggle />);
    // DarkModeIcon renders as SVG with data-testid or title
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls toggleMode when clicked', () => {
    useThemeStore.setState({ mode: 'light' });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});
```

---

## Folder Structure (additions)

```
src/
├── components/
│   ├── AppShell.tsx          ← NEW: 'use client' ThemeProvider wrapper
│   ├── ThemeToggle.tsx       ← NEW: sun/moon icon button
│   └── ThemeToggle.test.tsx  ← NEW: component tests
├── store/
│   ├── themeStore.ts         ← NEW: Zustand mode store
│   └── themeStore.test.ts    ← NEW: property test T1
└── app/
    └── layout.tsx            ← UPDATED: swap ThemeProvider for AppShell
```

`src/theme.ts` is superseded by the inline `createTheme` call inside `AppShell` and can be left in place (it is no longer imported by `layout.tsx`).
