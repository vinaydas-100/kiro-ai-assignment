# Implementation Plan: HelloWorld Next.js Project

## Overview

Scaffold a Next.js 16 (App Router) project at `D:\kiro` with TypeScript 6 strict mode, MUI v9, Zustand 5, Axios 1.13, Vitest 4, pnpm 10, and Node.js 24 LTS. The implementation is broken into discrete tasks that build on each other, ending with all pieces wired together and all tests passing.

## Tasks

- [x] 1. Initialise the Next.js project with pnpm and install all dependencies
  - Run `pnpm create next-app@latest . --typescript --app --no-tailwind --no-src-dir --eslint` inside `D:\kiro`, then move `app/` into `src/app/` and adjust imports
  - Alternatively, manually create `package.json` with the full dependency list from the design, then run `pnpm install`
  - Set exact versions: `next@^16.0.0`, `react@^19.0.0`, `react-dom@^19.0.0`
  - Add `@mui/material@^9.0.0`, `@mui/material-nextjs@^9.0.0`, `@emotion/react@^11.0.0`, `@emotion/styled@^11.0.0`, `@emotion/cache@^11.0.0`, `zustand@^5.0.0`, `axios@^1.13.0` to `dependencies`
  - Add `typescript@^6.0.0`, `@types/react@^19.0.0`, `@types/node@^24.0.0`, `vitest@^4.0.0`, `@vitejs/plugin-react@^4.0.0`, `jsdom@^25.0.0`, `@testing-library/react@^16.0.0`, `@testing-library/jest-dom@^6.0.0`, `fast-check@^3.0.0` to `devDependencies`
  - Set `"packageManager": "pnpm@10.x.x"` and `"engines": { "node": ">=24.0.0" }` in `package.json`
  - Confirm `pnpm-lock.yaml` is generated
  - _Requirements: 1.1, 7.1, 7.2, 7.4_

- [x] 2. Configure TypeScript, path aliases, and project scripts
  - Write `tsconfig.json` with `"strict": true`, `"target": "ES2017"`, `"moduleResolution": "bundler"`, and `"paths": { "@/*": ["./src/*"] }`
  - Update `package.json` `"scripts"` section: `"dev": "next dev --turbopack"`, `"build": "next build"`, `"start": "next start"`, `"lint": "next lint"`, `"test": "vitest --run"`, `"typecheck": "tsc --noEmit"`
  - Write `next.config.ts` with an empty `NextConfig` export (no `experimental.turbo`)
  - Write `.eslintrc.json` extending `"next/core-web-vitals"` and `"next/typescript"`
  - _Requirements: 2.1, 2.2, 2.4, 8.1, 8.3_

- [x] 3. Create the folder structure and stub files
  - Create directories: `src/app/`, `src/components/`, `src/store/`, `src/lib/`, `src/types/`, `src/test/`, `public/`
  - Create empty stub files (with placeholder exports) for `src/theme.ts`, `src/types/post.ts`, `src/store/counterStore.ts`, `src/lib/apiClient.ts`, `src/components/CounterCard.tsx`, `src/components/PostCard.tsx`
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 4. Implement the Post type and Axios API client
  - [x] 4.1 Write `src/types/post.ts` with the `Post` interface (`id`, `userId`, `title`, `body`)
    - _Requirements: 5.5_
  - [x] 4.2 Write `src/lib/apiClient.ts`: create Axios instance with `baseURL: "https://jsonplaceholder.typicode.com"` and `timeout: 5000`, export `fetchPost(id: number): Promise<Post>`
    - _Requirements: 5.1, 5.2_
  - [x]* 4.3 Write property test for `fetchPost` id round-trip in `src/lib/apiClient.test.ts`
    - Mock the Axios adapter so no real HTTP calls are made (`vi.mock('axios')` or `axios-mock-adapter`)
    - **Property 4: fetchPost id round-trip** — for any valid positive integer `id`, `fetchPost(id)` with a mocked response whose `id` equals the input SHALL return a Post where `post.id === id`
    - **Validates: Requirements 5.6**
    - Run with `fast-check`: `fc.assert(fc.property(fc.integer({ min: 1, max: 100 }), async (id) => { ... }))`
    - Minimum 100 iterations
    - Tag: `// Feature: hello-world-nextjs, Property 4: fetchPost id round-trip`

- [x] 5. Implement the Zustand counter store
  - [x] 5.1 Write `src/store/counterStore.ts` using `create<CounterState>` with `count`, `increment`, `decrement`, `reset`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x]* 5.2 Write property test for counter increment in `src/store/counterStore.test.ts`
    - **Property 1: Counter increment accumulates correctly** — for any non-negative integer `n`, calling `increment` `n` times from `count = 0` SHALL result in `count === n`
    - **Validates: Requirements 4.3, 4.7**
    - Use `fc.integer({ min: 0, max: 200 })` as the generator
    - Reset the store to 0 before each test run
    - Tag: `// Feature: hello-world-nextjs, Property 1: Counter increment accumulates correctly`
  - [x]* 5.3 Write property test for counter decrement in `src/store/counterStore.test.ts`
    - **Property 2: Counter decrement accumulates correctly** — for any non-negative integer `n`, calling `decrement` `n` times from `count = 0` SHALL result in `count === -n`
    - **Validates: Requirements 4.4, 4.8**
    - Tag: `// Feature: hello-world-nextjs, Property 2: Counter decrement accumulates correctly`
  - [x]* 5.4 Write property test for counter reset idempotence in `src/store/counterStore.test.ts`
    - **Property 3: Reset is idempotent regardless of prior state** — for any integer count value, calling `reset` SHALL produce `count === 0`; calling `reset` a second time SHALL leave `count === 0`
    - **Validates: Requirements 4.5, 4.9**
    - Use `fc.integer({ min: -1000, max: 1000 })` to drive the initial count via increment/decrement
    - Tag: `// Feature: hello-world-nextjs, Property 3: Reset is idempotent regardless of prior state`

- [x] 6. Implement the MUI theme and root layout
  - [x] 6.1 Write `src/theme.ts` with `'use client'` directive, `createTheme({ typography: { fontFamily: 'var(--font-roboto)' }, cssVariables: true })`
    - _Requirements: 3.4_
  - [x] 6.2 Write `src/app/layout.tsx` as a Server Component importing `AppRouterCacheProvider` from `@mui/material-nextjs/v16-appRouter`, wrapping children with it and with `ThemeProvider theme={theme}`; load Roboto via `next/font/google`
    - _Requirements: 3.3, 3.4_

- [x] 7. Implement the CounterCard and PostCard components
  - [x] 7.1 Write `src/components/CounterCard.tsx` with `'use client'` directive; use `useCounterStore` to read `count` and bind `increment`, `decrement`, `reset` to MUI `Button` components inside a `ButtonGroup`; all spacing via `sx` prop (MUI v9: no system props)
    - _Requirements: 4.6, 3.6_
  - [x]* 7.2 Write example-based unit test for CounterCard in `src/components/CounterCard.test.tsx`
    - Render `<CounterCard />` and assert: count "0" is visible, three buttons (−, Reset, +) exist
    - _Requirements: 4.6_
  - [x] 7.3 Write `src/components/PostCard.tsx` with `'use client'` directive; render MUI `Card` with `post.title` and `post.body` (use `sx={{ color: 'text.secondary' }}` instead of `color` prop — MUI v9), or MUI `Alert severity="error"` when `error` is non-null; do NOT use `paragraph` prop on `Typography`
    - _Requirements: 5.3, 5.4, 3.6, 3.7_
  - [x]* 7.4 Write property test for PostCard field rendering in `src/components/PostCard.test.tsx`
    - **Property 5: PostCard renders all Post fields** — for any `Post` object with arbitrary `title` and `body` strings, rendering `<PostCard post={post} error={null} />` SHALL produce output containing both `post.title` and `post.body`
    - **Validates: Requirements 5.3**
    - Use `fc.record({ id: fc.integer(), userId: fc.integer(), title: fc.string(), body: fc.string() })` as generator
    - Tag: `// Feature: hello-world-nextjs, Property 5: PostCard renders all Post fields`
  - [x]* 7.5 Write example-based unit test for PostCard error state in `src/components/PostCard.test.tsx`
    - Render `<PostCard post={null} error="Network error" />` and assert error alert is visible
    - _Requirements: 5.4_

- [x] 8. Implement the root page and wire everything together
  - Write `src/app/page.tsx` as an `async` Server Component that calls `fetchPost(1)` inside a try-catch; passes `post` (or `null`) and `error` (or `null`) as props to `<PostCard>`; renders MUI `Container` and `Typography` with "Hello World" heading; renders `<CounterCard />`
  - MUI v9: use `sx={{ gutterBottom: true }}` on `Typography` — do NOT use the `gutterBottom` prop as a system shorthand
  - MUI v9: all spacing/layout via `sx` prop only; no system props (`mt`, `mb`, etc.) passed directly
  - _Requirements: 3.1, 3.2, 3.6, 4.6, 5.3, 5.4_

- [x] 9. Configure Vitest and the test setup file
  - Write `vitest.config.ts` with `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/test/setup.ts']`, and `resolve.alias: { '@': path.resolve(__dirname, './src') }`
  - Write `src/test/setup.ts` importing `@testing-library/jest-dom`
  - _Requirements: 6.1_

- [x] 10. Checkpoint — run type-check and all tests
  - Run `pnpm typecheck` and confirm zero TypeScript errors
  - Run `pnpm test` and confirm all tests pass with exit code 0
  - Fix any errors before proceeding
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.3, 2.5, 6.4, 6.5, 6.6_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4", "5", "6"] },
    { "wave": 5, "tasks": ["7", "9"] },
    { "wave": 6, "tasks": ["8"] },
    { "wave": 7, "tasks": ["10"] }
  ]
}
```

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP run
- Each task references specific requirements for traceability
- Property tests use `fast-check` and run a minimum of 100 iterations each
- The `pnpm test` script uses `vitest --run` (single-execution mode, not watch mode)
- Turbopack is activated only by the `--turbopack` flag in the `dev` script — no `next.config.ts` changes needed
- MUI SSR integration requires `AppRouterCacheProvider` from `@mui/material-nextjs` — do not skip this or styles will render in `<body>` instead of `<head>`
