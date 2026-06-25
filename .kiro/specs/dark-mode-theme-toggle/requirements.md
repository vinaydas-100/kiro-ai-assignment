# Requirements Document

## Introduction

This document specifies requirements for the **Dark Mode Theme Toggle** skill added to the HelloWorld Next.js project. It extends the existing MUI v9 + Zustand setup with a user-controlled light/dark mode toggle whose preference is persisted in `localStorage` and defaults to the OS-level `prefers-color-scheme` setting.

## Glossary

- **ThemeStore**: A Zustand store that holds the active colour mode (`'light' | 'dark'`) and exposes a `toggleMode` action.
- **ThemeToggle**: A Client Component that renders an MUI `IconButton` switching between a sun icon (light mode) and a moon icon (dark mode).
- **ColorScheme**: The MUI v9 `colorSchemes` theme option that defines palettes for both `light` and `dark` modes.
- **Persistence**: Saving the user's chosen mode to `localStorage` under the key `theme-mode` so it survives page reloads.
- **OSDefault**: The initial mode resolved from `window.matchMedia('(prefers-color-scheme: dark)')` when no `localStorage` value exists.

---

## Requirements

### Requirement 1: Theme Mode Store

**User Story:** As a developer, I want a Zustand store that tracks the active colour mode, so that any component can read or change the theme without prop-drilling.

#### Acceptance Criteria

1. THE ThemeStore SHALL be defined in `src/store/themeStore.ts` and export a `useThemeStore` hook.
2. THE ThemeStore SHALL expose a `mode` field typed as `'light' | 'dark'`.
3. THE ThemeStore SHALL expose a `toggleMode` action that switches `mode` from `'light'` to `'dark'` and vice-versa.
4. WHEN `toggleMode` is called an even number of times, THE `mode` SHALL equal its value before those calls.
5. WHEN `toggleMode` is called an odd number of times, THE `mode` SHALL equal the opposite of its value before those calls.
6. THE ThemeStore SHALL initialise `mode` to `'light'` as the default server-safe value (no `window` access at module load time).

---

### Requirement 2: localStorage Persistence

**User Story:** As a user, I want my dark/light preference saved so it is restored when I return to the page.

#### Acceptance Criteria

1. WHEN `toggleMode` is called, THE ThemeStore SHALL write the new `mode` value to `localStorage` under the key `"theme-mode"`.
2. WHEN the application loads in the browser, THE ThemeStore SHALL read `localStorage["theme-mode"]`; IF a valid value (`'light'` or `'dark'`) is found, THEN `mode` SHALL be set to that value.
3. IF `localStorage["theme-mode"]` is absent or invalid, THEN THE ThemeStore SHALL fall back to the OS preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
4. ALL `window`/`localStorage` access SHALL be guarded so the store is safe to import in a Server Component or test environment (no `ReferenceError: window is not defined`).

---

### Requirement 3: ThemeToggle Component

**User Story:** As a user, I want a visible toggle button in the app header so I can switch between light and dark mode at any time.

#### Acceptance Criteria

1. THE ThemeToggle SHALL be defined in `src/components/ThemeToggle.tsx` as a `'use client'` Client Component.
2. WHEN `mode` is `'light'`, THE ThemeToggle SHALL render a `DarkMode` icon (moon).
3. WHEN `mode` is `'dark'`, THE ThemeToggle SHALL render a `LightMode` icon (sun).
4. WHEN the button is clicked, THE ThemeToggle SHALL call `toggleMode` from the ThemeStore.
5. THE ThemeToggle SHALL use an MUI `IconButton` with an accessible `aria-label` of `"toggle dark mode"`.
6. ALL MUI usage in ThemeToggle SHALL follow MUI v9 rules: spacing via `sx` prop only, no system props directly on components.

---

### Requirement 4: Layout Integration

**User Story:** As a developer, I want the ThemeProvider to react to the store's mode so MUI components automatically adopt the correct palette.

#### Acceptance Criteria

1. THE `src/app/layout.tsx` SHALL be refactored to delegate `ThemeProvider` and `ThemeToggle` rendering to a new `src/components/AppShell.tsx` Client Component (since reading Zustand state requires `'use client'`).
2. THE AppShell SHALL read `mode` from `useThemeStore` and pass it to `createTheme({ colorSchemes: { light: true, dark: true }, cssVariables: true })` via `defaultColorScheme` or by toggling `colorScheme` on the theme.
3. THE AppShell SHALL render `<ThemeToggle />` inside a top-right positioned MUI `Box` above the page content.
4. THE `src/app/layout.tsx` SHALL remain a Server Component; only `AppShell` shall carry the `'use client'` boundary.
5. THE existing `AppRouterCacheProvider` wrapper SHALL be preserved in `layout.tsx`.

---

### Requirement 5: Icon Dependency

**User Story:** As a developer, I want the MUI icons package available so the toggle can use standard sun/moon icons.

#### Acceptance Criteria

1. `@mui/icons-material` SHALL be added to `dependencies` in `package.json`.
2. THE version SHALL be `^9.0.0` to match the existing `@mui/material` version constraint.

---

### Requirement 6: Tests

**User Story:** As a developer, I want automated tests covering the toggle logic and the component, so regressions are caught immediately.

#### Acceptance Criteria

1. THE TestSuite SHALL include `src/store/themeStore.test.ts` with a property test:
   - **Property T1** — for any non-negative integer `n`, calling `toggleMode` `n` times from `mode = 'light'` SHALL result in `mode === 'light'` if `n` is even, `'dark'` if `n` is odd.
2. THE TestSuite SHALL include `src/components/ThemeToggle.test.tsx` with example-based tests:
   - Renders a button with `aria-label="toggle dark mode"`.
   - Clicking the button calls `toggleMode`.
   - Shows the moon icon when mode is `'light'` and the sun icon when mode is `'dark'`.
3. ALL new tests SHALL pass when `pnpm test` is run.
