# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm 9.4.0** on **Node 20** (see `engines` in `package.json` and `.nvmrc`).

- `pnpm dev` — Next.js dev server (Turbopack)
- `pnpm build` — production build (Turbopack)
- `pnpm lint` — ESLint (flat config: `eslint-config-next/core-web-vitals` + `/typescript`)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest run (Node env, files matching `**/*.test.ts(x)`)
- `pnpm test:watch` / `pnpm test:coverage`
- Run a single test: `pnpm vitest run path/to/file.test.ts` or filter with `-t "name"`

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every push/PR. The build step in CI uses placeholder Supabase env vars; locally it expects real ones.

## Required env vars

Defined and validated by `lib/env.ts` (zod). See `.env.example`. `loadPublicEnv()` / `loadServerEnv()` will throw at request time if anything is missing.

- Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- Server: `SUPABASE_SERVICE_ROLE_KEY`, `PT_EXTRACTOR_URL`, `PT_EXTRACTOR_TOKEN` (optional), `PT_SCANNER_BACKEND` (`llm` | `ocr` | `mock`, default `llm`)

Setting `PT_SCANNER_BACKEND=mock` (or `PT_EXTRACTOR_URL=mock`) makes scans use `lib/scanner/mock.ts` and skip the external extractor — useful for local dev without the knightvision-api service. `ocr` backend is intentionally not implemented.

## Architecture

**Product:** PawnTrail — photo of a paper chess scoresheet → OCR'd PGN → engine-reviewed game library. PRD lives in `PRD-v1-detailed.md`; the build plan/checklist is `tasks.md`. Domains: `pawntrail.com` (marketing), `pawntrail.app` (product). Brand/design tokens are in `brand/design-philosophy.md`, `app/globals.css`, and `styles/`.

### App Router layout

The `app/` tree uses three route groups, each with its own `layout.tsx`:

- `app/(marketing)` — public landing (`/`)
- `app/(auth)` — `/signin`, `/verify`, plus `actions.ts` server actions
- `app/(app)` — authed product surface: `/dashboard`, `/scan`, `/games/[gameId]`, `/openings`, `/settings`. Its layout calls `requireUser()` (redirects to `/signin`) and wraps children in `<AppShell>`.
- `app/auth/callback` — Supabase OAuth/email-link landing

### Auth + middleware

The Next.js middleware lives at **`proxy.ts` at the repo root** (note the non-standard filename — Next 16's `proxy()` API; do not rename to `middleware.ts`). It:

1. Calls `updateSession()` (`lib/supabase/middleware.ts`) on every matched request to refresh Supabase cookies.
2. For `PROTECTED_PREFIXES` (`/dashboard`, `/scan`, `/games`, `/openings`, `/settings`), checks `supabase.auth.getUser()` and redirects unauthenticated users to `/signin?redirect=...`.

There are three Supabase client factories — pick the right one for the context:
- `lib/supabase/client.ts` — browser components
- `lib/supabase/server.ts` `createSupabaseServerClient()` — RSCs and server actions (cookie writes are silently swallowed in RSC; the proxy handles refresh)
- `lib/supabase/middleware.ts` — middleware/proxy only

`lib/supabase/current-user.ts` `requireUser()` is the canonical "this RSC requires auth" helper; it returns `{ userId, profile }` or redirects.

### Database

Migrations live under `supabase/migrations/` and are the source of truth. Generated TypeScript types are in `lib/supabase/types.ts` with thin aliases (`Profile`, `Game`, `Move`, `Scan`, `BillingEvent`) in `lib/supabase/helpers.ts`.

Schema dependency order (matches migration filenames): `profiles → scans → games → moves → billing_events`. `profiles.id` is the FK to `auth.users.id`; row creation is handled by the trigger in `0005_profile_on_signup.sql`. RLS is enforced (`0002_rls_policies.sql`) — assume every query is scoped to the authenticated user.

Free-tier quota is enforced by a trigger (`0003_quota_trigger.sql`) plus app-level checks in `app/(app)/scan/actions.ts` against `profiles.scan_quota_used` / `scan_quota_limit` (default 15). Saving a scan-derived game goes through the `save_scan_as_game` Postgres function rather than direct inserts — call it via `supabase.rpc(...)`.

### Scan pipeline

The full flow lives in `app/(app)/scan/actions.ts` (server actions): `createScan` (uploads JPEG to the `scoresheets` storage bucket, inserts `scans` row) → `runScanner` (creates signed URLs, calls `extractMoves` from `lib/scanner/client.ts`, persists `raw_ocr_json`) → user reviews/edits in `components/scan/ReviewEditor.tsx` → `saveScanAsGame` (RPC).

`lib/pgn/build.ts` replays extracted move pairs through `chess.js` to validate SAN and emit per-ply FENs; `lib/pgn/classify.ts` and `suggestions.ts` add ECO classification and move-correction hints. These have unit tests — keep them green when changing extractor output shape.

### Engine (Stockfish)

Stockfish runs in the browser as a Web Worker loaded from `public/stockfish/stockfish.js` (`Worker("/stockfish/stockfish.js")` in `lib/stockfish/engine.ts`). Do **not** import `stockfish` from npm into client code — the WASM/JS pair must be served from `/public`. ESLint is configured to ignore `public/stockfish/**`.

The `Engine` class exposes a snapshot subscription model (multi-PV, depth, NPS, best move) consumed by `hooks/useEngine.ts` and `components/engine/EnginePanel.tsx`. Output is parsed by `lib/stockfish/parser.ts` (unit-tested).

### Path alias

`@/*` resolves to the repo root in both TS (`tsconfig.json`) and Vitest (`vitest.config.ts`). Always import via `@/lib/...`, `@/components/...`, etc.

### TypeScript strictness

`strict`, `noUncheckedIndexedAccess`, and `noImplicitOverride` are all on. Array/object accesses return `T | undefined` — handle the undefined case explicitly rather than asserting.
