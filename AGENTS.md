# AGENTS.md

## Project Overview
- This repository is `coffex`, a coffee tasting log app built with TanStack Start + React + shadcn/ui.
- Current scope is frontend-first mockup without backend.
- Data persistence is implemented with `localStorage` (`coffex.logs` key).
- Main user flow:
  1. Create a coffee log at `/new`
  2. View/filter logs at `/`
  3. Delete logs from the dashboard
  4. Confirm data persists after page reload

## Tech Stack
- Framework: TanStack Start (`@tanstack/react-router`, file-based routes)
- UI: shadcn/ui components in `src/components/ui`
- Styling: Tailwind CSS v4
- Language: TypeScript
- Package manager: `pnpm`
- E2E: Playwright (`e2e/coffee-log.spec.ts`)

## Important Directories
- `src/routes/`
  - `index.tsx`: Dashboard (KPI, filters, table, delete)
  - `new.tsx`: New log form
- `src/features/coffee/`
  - `types.ts`: Domain model
  - `storage.ts`: localStorage CRUD
  - `use-coffee-logs.ts`: app-level state hook
- `src/components/ui/`: shadcn components
- `e2e/`: Playwright E2E tests

## Required Commands
- Install dependencies:
  - `pnpm install`
- Run dev server:
  - `pnpm dev`
- Build:
  - `pnpm build`
- Preview production build:
  - `pnpm preview --host 127.0.0.1 --port 3000`
- Unit tests (Vitest):
  - `pnpm test`
- E2E tests (Playwright):
  - `pnpm test:e2e`
  - `pnpm test:e2e:headed`

## E2E Notes
- Playwright config uses a web server command:
  - `pnpm build && pnpm preview --host 127.0.0.1 --port 3000`
- This avoids dev-server plugin port conflicts seen with `pnpm dev` in E2E runs.
- Install browser binaries if needed:
  - `pnpm exec playwright install chromium`

## Coding Guidelines for This Repo
- Prefer existing shadcn components before creating custom UI components.
- Keep labels and UX text in Japanese unless there is a strong reason to change.
- Avoid introducing backend dependencies until explicitly requested.
- For new features, keep localStorage compatibility unless a migration plan is defined.

## Minimum Verification Before Commit
1. `pnpm build` passes
2. `pnpm test:e2e` passes (for UI-flow changes)
3. `git status` is clean except intentional changes

