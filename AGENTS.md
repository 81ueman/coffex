# AGENTS.md

## Project Overview
- This repository is `coffex`, a coffee tasting log app in a pnpm monorepo.
- Architecture is split into Web + API + Shared packages.
- Persistence is server-side SQLite (not localStorage) via Drizzle ORM.
- Main user flow:
  1. Create a coffee log at `/new`
  2. View/filter logs at `/`
  3. Delete logs from the dashboard
  4. Confirm data persists after page reload

## Tech Stack
- Monorepo: pnpm workspaces
- Web: TanStack Start + React + shadcn/ui + Tailwind CSS v4
- API: Hono + TypeScript
- DB: SQLite + Drizzle ORM
- Shared types: Zod schemas in `packages/shared`
- E2E: Playwright

## Important Directories
- `apps/web/`
  - `src/routes/`: UI routes (`index.tsx`, `new.tsx`)
  - `src/features/coffee/`: UI-facing domain hooks/types
  - `e2e/coffee-log.spec.ts`: Playwright E2E tests
- `apps/api/`
  - `src/app.ts`: Hono route definitions
  - `src/features/logs/repository.ts`: DB access logic
  - `src/db/schema.ts`: Drizzle schema
  - `test/app.test.ts`: API tests (Vitest)
- `packages/shared/src/coffee.ts`
  - shared Zod schemas and Coffee domain types

## Required Commands
- Install dependencies:
  - `pnpm install`
- Run dev servers:
  - `pnpm dev` (web + api)
  - `pnpm dev:web`
  - `pnpm dev:api`
- Build:
  - `pnpm build`
  - `pnpm build:web`
  - `pnpm build:api`
- Tests:
  - `pnpm test`
  - `pnpm test:web`
  - `pnpm test:api`
  - `pnpm test:e2e`

## Environment Variables
- API (`apps/api`)
  - `DATABASE_URL` (default: `./apps/api/data/coffex.db`)
  - `PORT` (default: `8787`)
- Web (`apps/web`)
  - `VITE_API_BASE_URL` (default: `http://127.0.0.1:8787`)

## E2E Notes
- Playwright starts API and Web preview via `apps/web/playwright.config.ts`.
- E2E uses API-backed data setup/cleanup (not localStorage clearing).
- Install browser binaries if needed:
  - `pnpm --filter @coffex/web exec playwright install chromium`

## Coding Guidelines for This Repo
- Prefer existing shadcn components before creating custom UI components.
- Keep labels and UX text in Japanese unless there is a strong reason to change.
- Keep API/Web contract type-safe through `packages/shared` schemas.
- For API input/output, prefer shared Zod schemas over ad-hoc types.
- Keep SQLite + Drizzle compatibility unless a migration plan is defined.

## Minimum Verification Before Commit
1. `pnpm build` passes
2. `pnpm test:api` passes for API changes
3. `pnpm test:e2e` passes for UI/API flow changes
4. `git status` is clean except intentional changes
