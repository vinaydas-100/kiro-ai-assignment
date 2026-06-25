---
name: Next.js Project Setup
description: Scaffold a Next.js project with the standard tech stack — App Router, TypeScript strict, MUI v9, Zustand 5, Axios, Vitest, pnpm
inclusion: manual
---

# Next.js Project Setup Skill

When asked to scaffold or create a new Next.js project, follow these standards exactly.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | `^16.0.0` | Framework, App Router |
| React | `^19.0.0` | UI runtime |
| TypeScript | `^6.0.0` | Type safety, strict mode |
| MUI Material | `^9.0.0` | Component library |
| MUI Material NextJS | `^9.0.0` | SSR/App Router integration |
| MUI Icons Material | `^9.0.0` | Icon set |
| Emotion (react, styled, cache) | `^11.0.0` | MUI peer dep, CSS-in-JS |
| Zustand | `^5.0.0` | Client state management |
| Axios | `^1.13.0` | HTTP client |
| Vitest | `^4.0.0` | Test runner |
| @vitejs/plugin-react | `^4.0.0` | Vitest React support |
| @testing-library/react | `^16.0.0` | Component testing |
| @testing-library/jest-dom | `^6.0.0` | DOM matchers |
| fast-check | `^3.0.0` | Property-based testing |
| jsdom | `^25.0.0` | Test DOM environment |
| @types/react | `^19.0.0` | React types |
| @types/node | `^24.0.0` | Node types |
| pnpm | `^9.0.0` | Package manager |
| Node.js | `>=22.0.0` | Runtime |

---

## package.json Structure

```json
{
  "name": "<project-name>",
  "version": "0.1.0",
  "packageManager": "pnpm@9.x.x",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest --run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@emotion/cache": "^11.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@mui/icons-material": "^9.0.0",
    "@mui/material": "^9.0.0",
    "@mui/material-nextjs": "^9.0.0",
    "axios": "^1.13.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "fast-check": "^3.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^6.0.0",
    "vitest": "^4.0.0"
  }
}
```

---

## Required Folder Structure

```
<project-root>/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Server Component: AppRouterCacheProvider + AppShell
│   │   └── page.tsx            # Server Component: async, fetches data
│   ├── components/
│   │   ├── AppShell.tsx        # 'use client': ThemeProvider + ThemeToggle
│   │   └── ThemeToggle.tsx     # 'use client': light/dark icon button
│   ├── lib/
│   │   └── apiClient.ts        # Axios instance + typed fetch functions
│   ├── store/
│   │   └── themeStore.ts       # Zustand theme mode store
│   ├── test/
│   │   └── setup.ts            # @testing-library/jest-dom import
│   └── types/                  # Shared TypeScript interfaces
├── .eslintrc.json
├── next.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Configuration Files

### tsconfig.json (required options)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack enabled via --turbopack CLI flag in dev script only
};

export default nextConfig;
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom';
```

### .eslintrc.json

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

---

## MUI v9 Rules (enforce always)

These are breaking changes in MUI v9 — never use the old patterns:

| ❌ Old (MUI v8) | ✅ New (MUI v9) |
|---|---|
| `<Box mt={2}>` | `<Box sx={{ mt: 2 }}>` |
| `<Typography color="text.secondary">` | `<Typography sx={{ color: 'text.secondary' }}>` |
| `<Typography paragraph>` | `<Typography sx={{ marginBottom: '16px' }}>` |
| `components` / `componentsProps` | `slots` / `slotProps` |
| `<Grid item xs={12}>` | `<Grid size={{ xs: 12 }}>` |

All spacing, colour, and layout on MUI components must go through `sx`. No system props directly on components.

---

## App Router SSR Setup (required)

`layout.tsx` must always include `AppRouterCacheProvider` from `@mui/material-nextjs/v16-appRouter` to prevent style flickering:

```tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { Roboto } from 'next/font/google';
import AppShell from '@/components/AppShell';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

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

`layout.tsx` must stay a Server Component — no `'use client'` directive. The `ThemeProvider` lives inside `AppShell` which carries the `'use client'` boundary.

---

## Axios Client Pattern

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://<your-api-base-url>',
  timeout: 5000,
});

export async function fetchResource<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<T>(path);
  return data;
}
```

- Always call Axios in Server Components (RSC) or server actions — not in Client Components — to keep it out of the browser bundle.
- Wrap calls in try/catch in `page.tsx` and pass `error` as a prop to client components.

---

## Testing Standards

- All tests run with `pnpm test` (`vitest --run` — never watch mode in CI).
- Use `fast-check` for property-based tests on pure functions and state machines.
- Mock Axios with `vi.mock` — never make real HTTP calls in tests.
- Tag property tests: `// Feature: <feature-name>, Property N: <description>`
- Minimum 100 iterations per property test (fast-check default).

---

## Verification Checklist

After scaffolding, always run:

1. `pnpm typecheck` — must exit 0, zero TS errors
2. `pnpm test` — must exit 0, all tests green
3. `pnpm build` — must complete without errors
