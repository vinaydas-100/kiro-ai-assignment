# Implementation Plan: Dark Mode Theme Toggle

## Overview

Add a persistent light/dark mode toggle to the existing HelloWorld Next.js project. Builds on MUI v9 `colorSchemes`, Zustand 5, and `localStorage`. All new code follows MUI v9 rules (no system props, spacing via `sx` only).

## Tasks

- [x] 1. Install @mui/icons-material dependency
  - Add `@mui/icons-material@^9.0.0` to `dependencies` in `package.json`
  - Run `pnpm install` to update `pnpm-lock.yaml`
  - _Requirements: 5.1, 5.2_

- [x] 2. Create the ThemeStore
  - Write `src/store/themeStore.ts`
    - Export `useThemeStore` with `mode: 'light' | 'dark'` and `toggleMode` action
    - Static initialiser defaults to `'light'` (SSR-safe)
    - `toggleMode` writes new value to `localStorage` guarded by `typeof window !== 'undefined'`
    - Module-level hydration block reads `localStorage` / `prefers-color-scheme` on client only
  - _Requirements: 1.1–1.6, 2.1–2.4_

- [x] 3. Write ThemeStore property test
  - Write `src/store/themeStore.test.ts`
  - **Property T1: toggleMode parity** — for any `n` in [0, 200], toggling `n` times from `'light'` results in `'light'` if `n` is even, `'dark'` if `n` is odd
  - Use `fast-check`: `fc.integer({ min: 0, max: 200 })`
  - Reset store to `'light'` in `beforeEach`
  - Tag: `// Feature: dark-mode-theme-toggle, Property T1: toggleMode parity`
  - _Requirements: 6.1_

- [x] 4. Create the ThemeToggle component
  - Write `src/components/ThemeToggle.tsx` with `'use client'` directive
  - MUI `IconButton` with `aria-label="toggle dark mode"`
  - Show `DarkModeIcon` when `mode === 'light'`, `LightModeIcon` when `mode === 'dark'`
  - Call `toggleMode` on click
  - _Requirements: 3.1–3.6_

- [x] 5. Write ThemeToggle component tests
  - Write `src/components/ThemeToggle.test.tsx`
  - Example test 1: button with accessible label renders
  - Example test 2: clicking the button toggles `mode` from `'light'` to `'dark'`
  - Example test 3: correct icon rendered for each mode
  - _Requirements: 6.2_

- [x] 6. Create the AppShell component
  - Write `src/components/AppShell.tsx` with `'use client'` directive
  - Read `mode` from `useThemeStore`
  - Build theme with `createTheme({ colorSchemes: { light: true, dark: true }, cssVariables: true, defaultColorScheme: mode })` inside `useMemo`
  - Wrap children in `ThemeProvider` + `CssBaseline`
  - Render `ThemeToggle` in a fixed top-right `Box`
  - _Requirements: 4.1–4.4_

- [x] 7. Update layout.tsx to use AppShell
  - Remove `ThemeProvider` and `theme` import from `src/app/layout.tsx`
  - Import and render `<AppShell>` in place of `<ThemeProvider>`
  - Keep `AppRouterCacheProvider` wrapping `AppShell`
  - `layout.tsx` must remain a Server Component (no `'use client'` directive)
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 8. Checkpoint — run type-check and all tests
  - Run `pnpm typecheck` — confirm zero TypeScript errors
  - Run `pnpm test` — confirm all existing + new tests pass with exit code 0
  - Fix any errors before marking complete
  - _Requirements: 6.3_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3", "4"] },
    { "wave": 4, "tasks": ["5", "6"] },
    { "wave": 5, "tasks": ["7"] },
    { "wave": 6, "tasks": ["8"] }
  ]
}
```

## Notes

- `src/theme.ts` is no longer imported by `layout.tsx` after task 7 but is left in place — it causes no harm and can be removed later
- `localStorage` access is always guarded — never accessed at module load time in a way that would break SSR or Vitest's jsdom environment
- Property test uses `useThemeStore.setState({ mode: 'light' })` to reset between runs — no store re-import needed
- MUI v9: `defaultColorScheme` on `createTheme` is the correct API to switch palettes; do NOT use `palette.mode` (deprecated pattern)
