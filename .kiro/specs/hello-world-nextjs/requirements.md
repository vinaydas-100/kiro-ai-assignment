# Requirements Document

## Introduction

This document specifies requirements for a **HelloWorld Next.js demonstration project** scaffolded at `D:\kiro`. The project serves as a reference implementation that follows organisational standards: Next.js 16 (App Router) with TypeScript 6 strict mode, MUI v9 for styling, Zustand 5 for state management, Axios 1.13 for data fetching, Vitest 4 for testing, pnpm 10 as the package manager, and Turbopack as the dev bundler. It runs on Node.js 24 LTS. It produces a single, working "Hello World" page that showcases all these technologies wired together correctly.

## Glossary

- **App**: The Next.js application, the top-level system under test.
- **AppRouter**: The Next.js App Router (`app/` directory) used for file-system-based routing.
- **Page**: A React Server Component or Client Component rendered at a specific URL route.
- **Store**: A Zustand store instance that holds and exposes reactive client-side state.
- **Counter**: The demonstration Zustand state — an integer value that can be incremented, decremented, and reset.
- **ApiClient**: The Axios-based HTTP client used to make outbound requests to external APIs.
- **Post**: A JSON object returned from the JSONPlaceholder public API containing `id`, `userId`, `title`, and `body` fields.
- **TestSuite**: The Vitest-based automated test suite.
- **TypeScriptCompiler**: The TypeScript compiler (tsc) configured with `strict: true`.
- **PackageManager**: pnpm, the required package manager for installing and managing dependencies.
- **Turbopack**: The Next.js built-in incremental bundler activated with the `--turbopack` flag during development.

---

## Requirements

### Requirement 1: Project Scaffolding and Folder Structure

**User Story:** As a developer, I want the project to follow Next.js App Router conventions with a well-organised folder structure, so that the codebase is immediately navigable and maintainable.

#### Acceptance Criteria

1. THE App SHALL be initialised as a Next.js project using the App Router (`app/` directory) located at `D:\kiro`.
2. THE App SHALL contain a `src/` directory that houses `app/`, `components/`, `store/`, `lib/`, and `types/` sub-directories.
3. THE App SHALL include a `public/` directory at the project root for static assets.
4. THE App SHALL include configuration files `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, and `.eslintrc.json` at the project root.
5. THE PackageManager SHALL be pnpm; the project root SHALL contain a `pnpm-lock.yaml` file and a `package.json` specifying `"packageManager": "pnpm@..."`.

---

### Requirement 2: TypeScript Strict Mode

**User Story:** As a developer, I want TypeScript configured in strict mode across the entire project, so that type errors are caught at compile time and code quality is enforced.

#### Acceptance Criteria

1. THE `tsconfig.json` SHALL set `"strict": true` under `compilerOptions`.
2. THE `tsconfig.json` SHALL set `"target"` to `"ES2017"` or later and `"moduleResolution"` to `"bundler"` or `"node16"`.
3. WHEN the TypeScriptCompiler runs as part of the build process, THE TypeScriptCompiler SHALL produce zero type errors against all source files in `src/`.
4. THE `tsconfig.json` SHALL include path aliases so that `@/` resolves to `src/`.
5. IF any source file anywhere in the project contains a TypeScript type error, THEN THE TypeScriptCompiler SHALL report that error and exit with a non-zero code.

---

### Requirement 3: MUI-Styled Hello World Page

**User Story:** As a developer, I want the root page to render a styled "Hello World" heading using MUI v9 components, so that MUI v9 integration is demonstrated visually and correctly.

#### Acceptance Criteria

1. THE Page at route `/` SHALL render an MUI `Typography` component displaying the text "Hello World".
2. THE Page SHALL apply an MUI `Container` component as the layout wrapper.
3. THE App SHALL include an MUI `ThemeProvider` in `src/app/layout.tsx` that wraps the entire application.
4. WHERE the MUI theme is configured, THE ThemeProvider SHALL accept a custom MUI theme object created via `createTheme`.
5. WHEN the root page is rendered in a test environment, THE Page SHALL contain the text "Hello World" in the rendered output.
6. ALL MUI component usage SHALL use the MUI v9 API: system props (`mt`, `mb`, `color`, etc.) SHALL NOT be passed directly to MUI components; ALL layout and spacing SHALL be expressed via the `sx` prop instead (e.g., `sx={{ mt: 2 }}`).
7. WHERE `Typography` is used, THE `paragraph` prop SHALL NOT be used; margin-bottom styling SHALL be applied via `sx={{ marginBottom: '16px' }}` if needed.
8. WHERE MUI components accept customisation, `slots` and `slotProps` SHALL be used instead of the removed `components`/`componentsProps` props.

---

### Requirement 4: Zustand Counter Store

**User Story:** As a developer, I want a Zustand store that manages a counter, so that client-side state management with Zustand is demonstrated.

#### Acceptance Criteria

1. THE Store SHALL be defined in `src/store/counterStore.ts` and export a `useCounterStore` hook.
2. THE Store SHALL expose a `count` field of type `number`, initialised to `0`.
3. THE Store SHALL expose an `increment` action that increases `count` by `1` only when explicitly called.
4. THE Store SHALL expose a `decrement` action that decreases `count` by `1` only when explicitly called.
5. THE Store SHALL expose a `reset` action that sets `count` back to `0`.
6. THE Page at route `/` SHALL render a counter UI that displays the current `count` value and provides buttons to trigger `increment`, `decrement`, and `reset`.
7. WHEN `increment` is called `n` times on a Store with initial `count` of `0`, THE Store SHALL have a `count` equal to `n`.
8. WHEN `decrement` is called `n` times on a Store with initial `count` of `0`, THE Store SHALL have a `count` equal to `-n`.
9. WHEN `reset` is called, THE Store SHALL set `count` to `0` regardless of the current value.

---

### Requirement 5: Axios API Data Fetching

**User Story:** As a developer, I want the page to fetch and display data from a public API using Axios, so that Axios integration is demonstrated.

#### Acceptance Criteria

1. THE ApiClient SHALL be configured in `src/lib/apiClient.ts` as an Axios instance with `baseURL` set to `"https://jsonplaceholder.typicode.com"`.
2. THE App SHALL contain a function `fetchPost(id: number): Promise<Post>` in `src/lib/apiClient.ts` that performs a GET request to `/posts/{id}` and returns a `Post` object.
3. THE Page at route `/` SHALL display the `title` and `body` of the fetched Post on the page.
4. IF the API request fails, THEN THE Page SHALL display a user-readable error message and SHALL NOT crash; THE App SHALL use error boundaries or try-catch blocks to prevent page crashes.
5. THE `Post` type SHALL be defined in `src/types/post.ts` with fields `id: number`, `userId: number`, `title: string`, and `body: string`.
6. WHEN `fetchPost` is called with a valid integer `id`, THE ApiClient SHALL return a `Post` object whose `id` field equals the requested `id`.

---

### Requirement 6: Vitest Test Suite

**User Story:** As a developer, I want Vitest configured with at least one passing test for each major feature, so that automated testing is established from the start.

#### Acceptance Criteria

1. THE `vitest.config.ts` SHALL configure Vitest with the `jsdom` environment and `globals: true`.
2. THE TestSuite SHALL include a test file `src/store/counterStore.test.ts` that tests the `useCounterStore` hook.
3. THE TestSuite SHALL include a test file `src/lib/apiClient.test.ts` that tests the `fetchPost` function using a mocked Axios adapter.
4. WHEN THE TestSuite is executed via `pnpm test`, THE TestSuite SHALL run all tests and report results.
5. WHEN all tests pass, THE TestSuite SHALL exit with code `0`; IF any individual test fails, THEN THE TestSuite SHALL exit with a non-zero code even if the test runner itself executes successfully.
6. IF any test fails, THEN THE TestSuite SHALL exit with a non-zero code, report the failing test name, and fail the build.

---

### Requirement 7: pnpm Package Manager

**User Story:** As a developer, I want pnpm used exclusively as the package manager, so that the project adheres to the organisational standard.

#### Acceptance Criteria

1. THE `package.json` SHALL list all required dependencies (`next`, `react`, `react-dom`, `@mui/material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`, `@emotion/cache`, `zustand`, `axios`) under `"dependencies"`, all at their latest LTS-compatible versions: Next.js `^16.0.0`, React `^19.0.0`, MUI `^9.0.0`, Zustand `^5.0.0`, Axios `^1.13.0`.
2. THE `package.json` SHALL list all required dev-dependencies (`typescript`, `@types/react`, `@types/node`, `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`) under `"devDependencies"`, at their latest LTS-compatible versions: TypeScript `^6.0.0`, `@types/node` `^24.0.0`, Vitest `^4.0.0`.
3. THE `package.json` SHALL define a `"scripts"` section with at minimum: `"dev"`, `"build"`, `"start"`, `"lint"`, `"test"`, and `"typecheck"` entries.
4. THE PackageManager SHALL be pnpm 10.x; both a `pnpm-lock.yaml` and a valid `package.json` (with `"packageManager": "pnpm@10.x.x"` and `"engines": { "node": ">=24.0.0" }`) SHALL be present at the project root.

---

### Requirement 8: Turbopack Dev Bundler

**User Story:** As a developer, I want Turbopack enabled for the development server, so that fast incremental builds are available during development.

#### Acceptance Criteria

1. THE `package.json` `"dev"` script SHALL include the `--turbopack` flag (e.g., `"next dev --turbopack"`).
2. WHEN the development server is started with `pnpm dev`, THE App SHALL start using Turbopack as indicated by the Next.js startup output; IF Turbopack cannot initialise, THE App MAY silently fall back to the default bundler without failing the start command.
3. THE `next.config.ts` SHALL NOT include deprecated `experimental.turbo` configuration; Turbopack SHALL be enabled exclusively via the CLI flag.
