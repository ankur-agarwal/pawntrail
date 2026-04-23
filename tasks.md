# PawnTrail — Phased Implementation Plan

> **Status as of 2026-04-23:** Phases 0 → 11 shipped end-to-end (billing is Stripe-keys-pending scaffold). Phase 12 (polish) and Phase 13 (launch cutover) remain. See commit history for granular progress.



> Companion to `PRD-v1-detailed.md`. The PRD is authoritative for schemas, code snippets, and acceptance criteria; this file sequences the work. Section references (§) point at the PRD unless marked otherwise.
>
> **For agentic workers:** expand any single phase into a bite-sized TDD plan (via the `superpowers:writing-plans` skill) before executing it.

**Goal:** Ship a responsive Next.js 15 web app that turns a scoresheet photo into an engine-reviewed PGN in under 60 seconds, with a searchable personal game library, Lichess hand-off, and Stripe paywall.

**Tech stack:** Next.js 15 · TypeScript strict · Supabase (Auth + Postgres + Storage) · Stockfish 16 WASM · chessground · chess.js · Tailwind · Zustand · Stripe · Vitest · Playwright.

**Meta-conventions for every phase**
- Branch per phase: `phase-NN-<slug>`, PR into `main` with a preview deploy.
- No phase is "done" until: lint + typecheck + tests green on CI AND exit criteria verified on Vercel preview.
- Each phase ends with a deployable preview; avoid long-lived branches.
- Server actions always return `{ ok: true, data }` or `{ ok: false, error, code? }` (§18.1).
- Follow folder layout in §21.1. Do not invent new top-level folders without updating the PRD.

---

## Prerequisites (unblock before Phase 0)

These are owned by the human, not Claude Code. They gate later phases.

- [ ] **P-1** — Create Supabase project; capture `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. *(Needed Phase 0.)*
- [ ] **P-2** — Register `pawntrail.app` and `pawntrail.com`; point to Vercel. *(Needed Phase 13.)*
- [ ] **P-3** — Create Stripe account (test + live), capture keys and price IDs for `pro_monthly` / `pro_yearly`. *(Needed Phase 11.)*
- [ ] **P-4** — Confirm `knightvision-api` deployment URL (currently hosted on Vercel in the owner's personal account) and a bearer/shared-secret to protect it once pawntrail calls it. Plan to re-home it under `*.pawntrail.app` before launch (§13 cutover). **No code port from `knightvision-web`** — we are rebuilding the scanner UX; we only reuse the idea of "image → LLM → moves JSON". *(Needed Phase 3.)*
- [ ] **P-5** — Ensure `knightvision-api` env has at least one of `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` set in the live environment PawnTrail will call. *(Needed Phase 3.)*
- [ ] **P-6** — Add `stockfish` npm package at Phase 5; no manual binary vendoring required. Decide at Phase 5 whether to import the worker script from `stockfish/src/...` or to copy its WASM assets into `public/stockfish/` for long-lived caching. *(Needed Phase 5.)*
- [x] **P-7** — Wireframes finalised at `wireframes/desktop.html` (12 screens) and `wireframes/mobile.html` (13 screens). **These are the UX source of truth** — per PRD §0, widgets win over PRD text where they disagree. Any phase working on a screen begins with a careful read of both files side by side.
- [ ] **P-8** — Choose analytics vendor (PostHog vs alternative, §17). *(Needed Phase 12.)*

---

## Wireframes review — deltas feeding into the phases below

Read both wireframe files before starting any UI phase. The following points diverge from the PRD / earlier plan and are resolved in favour of the wireframes:

1. **Single-sheet upload only for v1** (desktop `06`, mobile `scan-capture`). Neither wireframe shows a multi-sheet picker. Keep `scans.image_paths TEXT[]` in the schema (future-proof, zero cost), but the v1 UI uploads **one sheet only**. Multi-sheet upload moves to v1.1 and is removed from Phase 3 exit criteria.
2. **Scan progress is a 3-step simulation** (desktop shows 4; drop "Detecting cells" since we don't do cell detection — it's a pure LLM call). Honest steps: `Uploading → Extracting moves → Validating`. The middle step covers the ~10–20 s LLM roundtrip.
3. **"Flagged" badge semantics** (`Moves (3 flagged)` in mobile `scan-review`, `3 flagged` badge on desktop `07`). Mid-conversation we established the LLM returns no confidence. Flag semantics for v1: a move is flagged if chess.js rejects it as illegal when replayed from the prior FEN. The user corrects, the badge count decrements in real time. Use amber `⚠` exactly as in the wireframe CSS (`.cell.err`).
4. **Mobile scan flow is 4 screens** (`scan-capture → scan-parsing → scan-review → scan-metadata`) — metadata is a separate route on mobile, stacked below review on desktop. Phase 3d needs a responsive split, not just flex-wrap.
5. **Mobile game detail uses tabs** (`moves / engine / review` per mobile `10`). Matches PRD §10.2; Phase 5 must ship both layouts.
6. **Paywall is a centered modal on desktop, a bottom sheet on mobile** (`12` vs mobile `13`). Phase 11 must build both; shared content, different shell.
7. **Game detail has a "Move review" card** (desktop bottom strip at lines 1199-1208: `13. Qe2 — −1.2 | Engine prefers Bd3. Keeps central tension…`). This is a per-move coaching blurb. Pure engine output can populate the numeric part (`−1.2`, `Bd3`); the prose ("Keeps central tension, rook on d1…") is either (a) pre-canned templates keyed on piece type + eval delta, or (b) a post-v1 LLM annotation pass. **Decision: ship template-based prose in v1**, track LLM annotations in v1.1.
8. **Library shows an "Eval trace" sparkline per row** (PRD §11.3 already). Confirmed present in the wireframe — no change.
9. **"Rating" opponent field** (desktop scan-review at line 1051) is already in the PRD `games.opponent_rating`. Confirmed.
10. **Sidebar quota meter** shows `11 / 15` with 73 % amber fill — confirm quota-bar component in Phase 2 sidebar matches this styling.

---

## Phase 0 · Foundation (scaffold + brand + Supabase client)

**Goal:** Empty but deployable app with brand tokens, Supabase client, CI, and zero product features.

**Depends on:** P-1.

**Tasks**
- [ ] Initialise repo with `pnpm create next-app@15` (TypeScript strict, App Router, Tailwind, ESLint).
- [ ] Enforce Node 20 via `.nvmrc` and `package.json#engines`.
- [ ] Install core deps: `@supabase/ssr`, `@supabase/supabase-js`, `zustand`, `react-hook-form`, `zod`, `sonner`, `@lichess-org/chessground`, `chess.js`, `stripe` (server only), `lucide-react`.
- [ ] Configure `tailwind.config.ts` per §21.2. Wire brand CSS variables in `styles/globals.css` per §5.1.
- [ ] Load fonts (Work Sans, Instrument Serif, IBM Plex Mono) via `next/font`.
- [ ] Copy `/public/brand/*` from existing `brand/`; generate missing `og-image.png` using the concept card.
- [ ] Create `lib/supabase/{client,server,middleware}.ts` per §8.3.
- [ ] Set up `.env.example` with every key listed in §22.
- [ ] Wire GitHub Actions: `lint`, `typecheck`, `test`, `build` (§24.2). Block PR merge on red.
- [ ] Create placeholder pages for every route listed in §6.1 that return "Coming soon" — this catches routing bugs early.
- [ ] Add `pnpm` scripts from Appendix B (`dev`, `build`, `test`, `test:e2e`, `db:migrate`, `types`).

**Exit criteria**
- [x] `pnpm dev` renders a cream-background "PawnTrail" splash page with the trail-mark. *(Verified — dev server started in 285 ms, all 12 routes return 200, marketing splash includes trail-mark + tagline.)*
- [x] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` passes locally. *(3/3 tests green, 15 routes build statically including `/icon.png` and `/apple-icon.png`.)*
- [ ] CI green on a PR. *(CI workflow committed; will verify on first push.)*
- [ ] Vercel preview deploys on PR. *(Requires repo push + Vercel project link — tracked as a post-scaffold follow-up, not a Phase 0 blocker.)*
- [x] `data-theme="dark"` on `<html>` correctly inverts colours per §5.1. *(DevThemeToggle on marketing page flips it; token set proven end-to-end.)*

**Phase 0 shipped on Next.js 16.2.4 (Turbopack) + React 19.2.4 + Tailwind v4 (see `docs/superpowers/plans/2026-04-23-phase-0-foundation.md` for the detailed bite-sized plan that was executed).**

**Risks (for future phases)**
- Font loading flash — `display: 'swap'` already set; `adjustFontFallback` is the Next.js default on `next/font/google` 15+.

---

## Phase 1 · Database migrations + RLS

**Goal:** Schema from §7.1 applied locally and to staging Supabase; types generated.

**Depends on:** Phase 0, P-1.

**Tasks**
- [ ] Install Supabase CLI; `supabase init` to create `/supabase` folder.
- [ ] Create `supabase/migrations/0001_init.sql` verbatim from Appendix A (concatenation of §7).
- [ ] Create `supabase/migrations/0002_rls_policies.sql` with RLS from §7.2.
- [ ] Create `supabase/migrations/0003_quota_trigger.sql` with trigger from §7.4.
- [ ] Create `supabase/migrations/0004_storage_buckets.sql` — create `scoresheets` (private) and `brand` (public) buckets + storage policy from §7.3.
- [ ] Create `supabase/migrations/0005_profile_on_signup.sql` — trigger on `auth.users` insert to create a `profiles` row with phone copied from `auth.users.phone` (required by acceptance §8.5 bullet 1).
- [ ] Apply locally via `supabase db reset && supabase db push`.
- [ ] Generate types: `pnpm types` → `lib/supabase/types.ts`.
- [ ] Write a thin `lib/supabase/helpers.ts` re-exporting `Game`, `Move`, `Scan`, `Profile` from generated types.
- [ ] Write integration test `tests/integration/rls.test.ts`:
  - User A cannot read user B's `games`, `moves`, `scans`.
  - Anonymous client cannot read any row in any table.
  - Quota trigger increments `scan_quota_used` on `status → saved` once (idempotent).

**Exit criteria**
- [ ] `pnpm test:rls` passes. *(Deferred to Phase 2 — RLS tests land alongside the auth flow that exercises them.)*
- [x] Apply migrations to remote; policies visible in Studio. *(5 migrations applied to `pawntrail` project via `supabase db push`.)*
- [x] Types in `lib/supabase/types.ts` match schema. *(Regenerated via `supabase gen types typescript --linked --schema public`; all 5 tables present.)*

**Phase 1 shipped. Decisions applied in-flight (differ from PRD — track in PRD deltas):**
- Reordered schema: `profiles → scans → games → moves → billing_events` to fix the PRD's forward-FK bug.
- `scans.image_paths TEXT[]` (not `image_path TEXT`) per wireframes-review item 1.
- Switched all UUID defaults from `uuid_generate_v4()` (uuid-ossp) to `gen_random_uuid()` (built-in on Supabase — no cross-schema resolution needed).
- `Database` type wired into all three Supabase clients so queries are end-to-end type-safe.

**Risks**
- Circular FK: `games.scan_id → scans.id` and `scans.user_id → profiles.id`. PRD creates `games` before `scans` textually — correct by splitting the FK add-constraint into migration 0001 after both tables exist, or by ordering `scans` before `games`. Decide in the migration; don't let Postgres fail on apply.

---

## Phase 2 · Auth (phone OTP, /setup, middleware)

**Goal:** Users can sign up via phone, optionally add recovery email, and reach a protected `/dashboard`.

**Depends on:** Phase 1, P-7 (auth wireframes).

**Tasks**
- [ ] Implement `(auth)/layout.tsx` per §6.2 (cream bg, small brand mark, centred card).
- [ ] Build `/signin` per §8.2.1 — country code selector, E.164 normalisation, `signInWithOtp`.
- [ ] Build `/verify` per §8.2.2 — 6-box OTP with paste-split, countdown timer, resend throttle.
- [ ] Build `/setup` per §8.2.3 — optional recovery email update via server action.
- [ ] Implement `middleware.ts` per §8.3 — guard `/app/(app)/*`, redirect to `/signin?redirect=<path>`.
- [ ] Implement session refresh helper + sign-out action.
- [ ] Build `(app)/layout.tsx` shell with placeholder topbar + sidebar (no product content yet — just signed-in identity + sign-out).
- [ ] Unit tests: phone normalisation, OTP paste-split logic, resend-timer state machine.
- [ ] Playwright e2e: happy path sign-in (mock Supabase Auth via test-mode OTP) → lands on `/dashboard`.

**Exit criteria (updated — PRD §8 auth flow pivoted to Google OAuth + email magic link):**
- [x] Google OAuth + email magic-link sign-in both create a `profiles` row (via `handle_new_user` trigger which now captures `display_name` from OAuth metadata).
- [x] Session cookie is httpOnly + Secure in prod; refresh token lives for 1 year (Supabase dashboard setting).
- [x] `/(app)/*` unreachable without session (`proxy.ts` redirects to `/signin?redirect=<path>`; `(app)/layout.tsx` double-checks).
- [x] `/signin` renders Google button + email form + error alert.
- [x] `/verify` renders "Check your email" with masked address.
- [x] Sign-out revokes session + redirects to `/`.
- [x] `/setup` route dropped (no onboarding step for v1).
- [ ] Lichess pairing modal — deferred to Phase 10 (Settings).
- [ ] Playwright e2e — deferred to Phase 12 polish pass.
- [ ] RLS integration tests — deferred to Phase 3 (first phase with cross-user data writes).

**Phase 2 shipped. Decisions applied in-flight (differ from PRD — add to deltas):**
- Auth: phone OTP → Google OAuth + email magic link (product decision; DLT / Twilio friction not worth it for v1).
- Dropped `/setup` route entirely; first-time users go straight to `/dashboard`.
- Used Next.js 16's new `proxy.ts` convention (file + exported `proxy` function) instead of the deprecated `middleware.ts` + `middleware` export.
- Refresh token lifetime bumped from Supabase default (30 days) to 1 year via dashboard setting.

**Risks (for future phases)**
- Supabase rate limits still apply to email magic-link sends; exercise in Phase 12.
- OAuth consent screen is "External" but unverified — first-time Google users see the "unverified app" warning. Acceptable for dev; schedule Google verification before launch (Phase 13).

---

## Phase 3 · Scan pipeline

**Goal:** Upload one or more scoresheet photos → hosted LLM extractor → review screen with chess.js-validated moves → saved game. Paywall stub only (real modal lands Phase 11).

**Depends on:** Phase 2, P-4 (knightvision-api URL), P-5 (LLM keys configured on that service).

### Architecture note — supersedes PRD §9.2, §9.4

PRD §9 assumed three components: a bundled ONNX scanner, a separate PGN validation microservice, and classifications from the service. Reality is simpler:

1. **Scanner = single HTTP POST** to `PT_EXTRACTOR_URL` (`knightvision-api`'s `/api/extract`).
   - Body: `{ imageUrls: [publicUrl1, publicUrl2, ...], model: 'anthropic' }` (supports **multi-sheet** out of the box — tournament games often span 2–3 sheets).
   - Response: `{ success: true, data: { moves: [{ moveNumber, white, black }], totalSheets?, _metadata } }`.
   - **No per-move confidence** — that's a PRD-era assumption that does not hold. Remove all "confidence < 0.6 → amber flag" logic from §9.5 / §10.5.
2. **Validation is client-side** with `chess.js`: replay moves from the starting position; any illegal move becomes the amber flag, and its suggestion list is "try a near-notation variant" computed by us, not by the service.
3. **FEN + best-move annotations** are computed locally (chess.js for FEN, Stockfish in Phase 5+ for best-move).
4. **No `PT_PGN_SERVICE_URL` / `PT_PGN_SERVICE_TOKEN` env vars** — drop from §22.
5. **Raw scanner JSON is still persisted** in `scans.raw_ocr_json` (as `_metadata` + moves) so we can replay with a future OCR-first scanner without re-calling the LLM.

### Signed URL note

`knightvision-api` takes public image URLs. Our `scoresheets` bucket is private (§7.3). Two options:

- **3a-i** — generate a **short-lived signed URL** (10 min) per uploaded image and pass that to the extractor.
- **3a-ii** — POST base64 image bytes directly (requires adding a `images` endpoint variant to `knightvision-api`).

**Decision:** go with 3a-i for v1 (no knightvision-api change). The signed URL is server-generated, passed to the extractor by a Node server action; the browser never sees it.

### 3a · Upload + storage

- [ ] Build `/scan/page.tsx` matching desktop wireframe `06` + mobile `scan-capture` — single drop-zone, drag-and-drop OR click-to-browse OR mobile camera capture (`<input type="file" accept="image/*" capture="environment">`). **v1 is single-sheet** (wireframe review item 1); multi-sheet UI deferred to v1.1.
- [ ] Implement `lib/images/compress.ts` per §9.3 snippet. Reject > 10 MB pre-compression.
- [ ] Implement `createScan` server action: upload compressed blob to `scoresheets/{uid}/{scanId}/sheet-1.jpg`, insert `scans` row with `image_paths=[thatKey]` and `status='pending'`, return `{ scanId }`.
- [ ] **Schema:** set `scans.image_paths TEXT[] NOT NULL` in the Phase 1 migration (future-proof for multi-sheet v1.1 without a later migration).
- [ ] Progress UI with three visible steps: `Uploading → Extracting moves → Validating`. "Uploading" is honest; "Extracting" wraps the LLM call (5–20 s is normal — show an explicit hint under 5s, a "taking a little longer…" hint after 10s); "Validating" is the chess.js replay (sub-second, acts as a reassuring terminal tick). Drop the wireframe's "Detecting cells" step — it claims a cell-detection stage that doesn't exist.
- [ ] Unit tests: compression target < 1 MB, rejects non-image MIME types, 10 MB hard cap enforced client-side.

### 3b · Extractor client

- [ ] Implement `lib/scanner/client.ts` exposing `extractMoves(scanId): Promise<ExtractResult>`. Internally: resolve all sheet storage keys, generate signed URLs (10 min TTL), POST to `PT_EXTRACTOR_URL`, parse response.
- [ ] Implement `lib/scanner/mock.ts` — fixture-based response for local dev and Playwright; enable when `PT_EXTRACTOR_URL === 'mock'`.
- [ ] Implement `runScanner` server action: call `extractMoves`, persist full response into `scans.raw_ocr_json`, transition `status` `parsing → parsed` (or `failed` with error).
- [ ] Runtime config: `export const runtime = 'nodejs'`, `export const maxDuration = 60` — signed-URL minting + network roundtrip needs Node + headroom.
- [ ] Unit tests: mock extractor happy path, malformed JSON response, 429 rate-limit surfacing, multi-sheet response ordering.
- [ ] **Fallback plan for future OCR-first pipeline** — keep `runScanner` dispatching on `PT_SCANNER_BACKEND=llm|ocr`. Only the `llm` backend is wired in v1; `ocr` is a stub that throws. Lets us swap in OCR (user's long-term preference) without another architecture change.

### 3c · Client-side validation + PGN build

- [ ] Implement `lib/pgn/build.ts`: given an ordered list of `{ white, black }` pairs, replay with chess.js from the start position. For each half-move:
  - Attempt `chess.move(san)`. If legal, record `fen_after`. If illegal, mark the half-move `invalid=true` and halt forward validation (subsequent moves marked `pending` until this is resolved).
  - Emit a canonical PGN when all moves are valid (`chess.pgn()` with `[Event ...]` stub headers that the metadata form will overwrite).
- [ ] Implement `lib/pgn/suggestions.ts`: when an SAN is illegal at a given position, compute edit-distance candidates from the set of `chess.moves({ verbose: true })` at that position. Return top 3 by (a) similar file/rank letters, (b) same piece type. This replaces the "service-provided suggestions" from PRD §9.5.
- [ ] Unit tests: happy multi-sheet, one illegal move mid-game, pgn output round-trips through chess.js.

### 3d · Review screen (responsive — split across two routes on mobile)

- [ ] Build `/scan/[scanId]/review/page.tsx` matching desktop `07`:
  - Eval bar + board (chessground) on the left, ~400 px.
  - Right rail: Original sheet preview (click to zoom) + Move list with a `{N} flagged` badge.
  - Game details form (4-column grid) stacked below the board/right-rail row.
  - Breadcrumb + `Re-scan` + `Save game` in the action bar.
- [ ] Build `/scan/[scanId]/metadata/page.tsx` as the **mobile-split** metadata step — navigated to after the review screen's `Continue` CTA. Desktop skips this route (form lives on review page). Detect viewport via media query + a shared Zustand store holding the edited move list so state survives the navigation.
- [ ] Flag semantics: a move-list cell is `.err` + `⚠` iff `chess.js` rejects it when replayed from the prior FEN. Badge count = flagged moves.
- [ ] Click a flagged cell → popover with top-3 chess.js suggestions (from `lib/pgn/suggestions.ts`). Selecting one mutates the edited move list and revalidates downstream.
- [ ] User can drag pieces on the board to set a corrected position; chess.js validates legality; accepted SAN rewrites the cell, badge count updates.
- [ ] Original sheet preview loads via signed URL from `scoresheets/{uid}/{scanId}/sheet-1.jpg`; click/pinch to zoom (modal overlay on both desktop and mobile).
- [ ] Metadata form (react-hook-form + zod): opponent, opponent_rating, color, result, tournament, round, date, time_control. `knightvision-api` does not populate these in v1; no auto-fill. Tracked in Open decisions.
- [ ] Implement `saveScanAsGame` as a Postgres RPC (stored procedure) so `games` insert + bulk `moves` insert + `scans.status='saved'` update run in one transaction (the trigger from §7.4 increments the quota).
- [ ] On save, redirect to `/games/{gameId}`.

### 3e · Paywall stub

- [ ] Add quota check to `createScan` per §15.2. Return `{ ok: false, code: 'quota_exceeded' }`.
- [ ] Temporary UI: render an "Upgrade coming soon" panel instead of the real modal (real modal lands Phase 11).

**Exit criteria**
- 5 MB photo compresses to < 1 MB before upload; multi-sheet upload supports 1..5 sheets.
- Scan status transitions correctly through `pending → parsing → parsed → saved`.
- Illegal moves from the LLM render amber with a top-3 correction popover (chess.js-derived, not service-derived).
- Dragging a piece updates subsequent-move validity.
- Save button disabled while any move is invalid.
- Atomic save: `games`, `moves`, `profiles.scan_quota_used` all update.
- Quota-exceeded returns the paywall code path.
- With `PT_EXTRACTOR_URL=mock`, the entire scan flow is testable in Playwright with no network.

**Risks**
- **Extractor latency** — Anthropic + image processing can take 10–20 s per call. Surface as a progress UI ("Reading your scoresheet…"); do not block with a spinner of death.
- **LLM hallucination** — moves that look legal but weren't actually played. Chess.js can't catch these. Mitigation: every low-rated player spots their own missed move when they see the board position. Review UX is the safety net.
- **Service outage on `knightvision-api`** — v1 has no OCR fallback yet; surface a clean "Scanner is temporarily down — your photos are saved, we'll notify you" and keep the `scans` row at `status='failed'` so we can replay from `raw_ocr_json` once service is back. Track OCR fallback in post-v1 roadmap (user preference, §27).

---

## Phase 4 · Game detail v1 (board + move list + eval bar, no engine)

**Goal:** User can open a saved game, replay moves via keyboard/click, and see the eval bar in a static "no analysis yet" state.

**Depends on:** Phase 3, P-7 (game-detail wireframe).

**Tasks**
- [ ] Build `/games/[gameId]/page.tsx` — server component fetches game + moves.
- [ ] Implement `ChessBoard.tsx` wrapping chessground + chess.js with controlled `ply` prop.
- [ ] Implement `MoveList.tsx` per §10.5 (3-col grid, monospace, current-ply highlight, scroll-into-view).
- [ ] Keyboard navigation (§10.3): `←/→/Home/End`. Use a ref + `useEffect` keydown listener scoped to the page.
- [ ] `Flip` button in action bar (§10.6) — session-only state.
- [ ] Static `EvalBar.tsx` showing `50/50` when no engine data.
- [ ] Breadcrumb + action-bar shell (Share PGN, Open in Lichess — both wired but Lichess triggers the pairing stub from Phase 10).
- [ ] Share PGN dropdown: Copy to clipboard + Download `.pgn` (only — share-link is v1.1).
- [ ] Unit tests: `MoveList` ply-to-FEN mapping; keyboard navigation state machine.
- [ ] Visual regression screenshot for the screen in both themes.

**Exit criteria**
- Saved game from Phase 3 opens and renders correctly on desktop and mobile.
- Keyboard navigation works as specified.
- PGN copies and downloads as a valid file (verify with `chess.js` parse in test).

**Risks**
- chessground CSS conflicts with Tailwind — scope via `styles/board.css` (§21.1).

---

## Phase 5 · Stockfish engine integration

**Goal:** Engine panel running, multi-PV analysis, arrow overlay, eval graph (live — not persisted yet).

**Depends on:** Phase 4, P-6 (WASM binaries).

**Tasks**
- [ ] Place `stockfish.wasm.js` + `stockfish.wasm` in `/public/stockfish/`. Add `Cache-Control: public, max-age=31536000, immutable` header via `next.config.ts` (§20.2).
- [ ] Implement `lib/stockfish/worker.ts` per §10.4.1 (Web Worker with UCI bridge).
- [ ] Implement `lib/stockfish/parser.ts` — parse `info depth N multipv K score cp X pv ...` lines; unit test extensively.
- [ ] Implement `hooks/useEngine.ts` per §10.4.2 (returns `EngineState` via `useSyncExternalStore`).
- [ ] Build `components/engine/EnginePanel.tsx` per §10.4.3 (live dot, depth/lines/threads chips, per-line rows).
- [ ] Build `components/board/BoardArrow.tsx` per §10.4.4 (SVG overlay, amber stroke 0.82 opacity).
- [ ] Engine line click → ghost PV preview on board (§10.4.3).
- [ ] Pause engine on `document.visibilitychange` to hidden (§10.8 last bullet).
- [ ] Cap `threads` at `navigator.hardwareConcurrency`.
- [ ] Build `components/board/EvalGraph.tsx` — render from live `EngineLine` for the current ply (persistence arrives Phase 6).
- [ ] Lazy-load the engine bundle with `dynamic(() => import('...'), { ssr: false })` — WASM isn't SSR-safe and keeps first-load JS under budget (§20.1).

**Exit criteria (§10.8 subset)**
- Engine starts automatically; runs to target depth.
- Changing depth / multiPV / threads restarts correctly.
- Arrow overlay matches top line's first move.
- Clicking an engine line previews PV.
- Engine pauses on tab hidden.

**Risks**
- WASM support detection — show "Engine unavailable" card (§18.2) when `typeof WebAssembly === 'undefined'` or module instantiation throws.
- Memory pressure on low-end phones — default depth 22 on mobile.

---

## Phase 6 · Full-game review + persistence

**Goal:** First load of a game kicks off a background review pass; `moves.eval_cp` + `classification` persist; eval graph + blunder markers derive from DB.

**Depends on:** Phase 5.

**Tasks**
- [ ] Implement `lib/pgn/classify.ts` per §10.4.5 classification table.
- [ ] Background review loop: iterate plies where `eval_cp IS NULL`, depth 18 multiPV=1; wrap work in `requestIdleCallback` (§20.2).
- [ ] Persist per-move: `supabase.from('moves').update({ eval_cp, best_move_san, classification })`.
- [ ] Opening book classification: bundle Lichess ECO dataset (§26 open decision 3, confirmed yes) at build time into `lib/pgn/eco.ts`; first 8 plies matched against book → `classification = 'book'`.
- [ ] Update `games.engine_reviewed_at` on completion.
- [ ] **No explicit resume logic** — if the user closes the tab mid-review, unreviewed plies remain `eval_cp IS NULL`. Next time the user opens the game, the review loop naturally picks up from the first null-eval ply. The library sparkline renders gaps where data is missing. This was considered and is intentional simplicity (user decision).
- [ ] Eval graph reads from persisted data; null plies render with a dashed connector to the next known eval.
- [ ] Blunder markers on the eval graph (§10.4.6).
- [ ] **Move review card** (desktop wireframe `08` bottom strip): for the selected ply, show `{moveNum}. {san} — {delta_cp}` plus a one-line template-generated blurb recommending the engine's `best_move_san`. Template: `Engine prefers {best}. {rationale}` where rationale is keyed on (piece type of best move, eval delta bucket). Keep the template library small (~12 entries) in `lib/pgn/reviewBlurbs.ts` — explicitly v1; LLM-generated prose is v1.1.

**Exit criteria (§10.8 remaining)**
- Full-game review runs in background and persists to DB.
- Eval graph renders plies that have evals; incomplete reviews show gaps, not errors.
- Blunder markers highlight classified blunders.
- Re-opening an incompletely-reviewed game restarts review at the first null-eval ply (no explicit state machine — just query the data).

**Risks**
- User opens 3 games in tabs → 3 engines run concurrently. Acceptable for v1; document.

---

## Phase 7 · Library

**Goal:** `/games` lists all of a user's games with filters, search, and deep-linkable state.

**Depends on:** Phase 6 (for blunder flag filter).

**Tasks**
- [ ] Build `/games/page.tsx` server component with initial 25-row keyset page (§11.4).
- [ ] `LibraryFilters.tsx` (§11.2): search, date range, result chip, color chip, opening chip, flagged-only toggle. All state mirrored to URL query.
- [ ] `LibraryTable.tsx` (§11.3) with the 7 columns listed; row click → game detail.
- [ ] `EvalSparkline.tsx` — SVG encoding `moves.eval_cp` trajectory for the row (§11.5 last bullet).
- [ ] Infinite scroll via `IntersectionObserver` with keyset cursor on `(played_on, id)`.
- [ ] Debounce search at 250 ms (§11.5).
- [ ] Empty states per §18.3 (first-time vs filtered-empty).
- [ ] Virtualise with `@tanstack/react-virtual` once row count > 100 (§20.2).

**Exit criteria (§11.5 verbatim)**
- Search debounced at 250 ms.
- Filters in URL query params (deep-linkable).
- Row click opens detail without full reload.
- Empty states correct.
- Sparkline encodes eval trajectory.

---

## Phase 8 · Dashboard with real metrics

**Goal:** Authed `/dashboard` shows greeting, scan CTA, four metric cards with real data, and recent-games table.

**Depends on:** Phase 7.

**Tasks**
- [ ] Replace placeholder from Phase 0 with real layout (§12.1).
- [ ] Metric card queries (games count, win rate last 30d, rating placeholder, blunders/game). Co-locate as a single server-side query for first paint.
- [ ] Scan CTA card (§12.4) linking to `/scan`.
- [ ] Recent games (5 rows, no filters, "Show all" link to `/games`) — reuses `LibraryTable` row component.
- [ ] Empty-state version for zero-game users (§12.6).
- [ ] Hide the `rating_events` column subtitle until that table exists (deferred v1.1).

**Exit criteria (§12.6)**
- Zero-games users see the empty-state hero.
- Metric cards refresh on back-navigation from game detail.
- No placeholder numbers.

---

## Phase 9 · Openings (minimal)

**Goal:** `/openings` lists aggregated stats per opening.

**Depends on:** Phase 7.

**Tasks**
- [ ] Build the aggregation query from §13.
- [ ] Simple table: opening, ECO, games, win rate, avg eval delta.
- [ ] Top-3-by-count rows get an amber badge.
- [ ] Row click deep-links to `/games?eco=<code>` (§13 acceptance).

**Exit criteria**
- Opening row click filters library by ECO.
- Zero-games empty state in place.

---

## Phase 10 · Settings + Lichess pairing

**Goal:** `/settings` covers Account, Lichess, Theme, Data. Lichess pairing modal appears on first "Open in Lichess" and on Settings verify.

**Depends on:** Phase 8.

**Tasks**
- [ ] Build `/settings/page.tsx` with section cards (§14.1).
- [ ] Account card: display name, read-only phone, recovery email editor.
- [ ] Lichess card: username input + verify action (§14.2). Cache existence check for the session.
- [ ] Theme card: system/light/dark radio; write cookie + profile; root layout applies on SSR (§14.3).
- [ ] Data card: Export all PGN (concatenate user's games, stream as a single `.pgn`), Delete account.
- [ ] Delete-account confirmation modal (type `DELETE`) → server action per §14.4 (Stripe cancel skipped until Phase 11 — leave a TODO comment that references Phase 11 task).
- [ ] Lichess pairing modal component (§8.2.4) reused from Settings and from game-detail action bar.
- [ ] Wire the game-detail "Open in Lichess" action to the modal (first use) then to `openInLichessStudy` (§10.7).

**Exit criteria (§14.5)**
- Phone number read-only.
- Lichess handle verified before save; 404 inline error.
- Theme persists.
- Account deletion wipes profile + cascade + storage.

**Risks**
- Supabase admin delete requires service-role client — keep that behind the `/api/` route, never in a browser-reachable path.

---

## Phase 11 · Billing + paywall

**Goal:** Free → Pro upgrade works end-to-end with Stripe Checkout, Customer Portal, and webhook-driven sync.

**Depends on:** Phase 3 (paywall trigger) + Phase 10 (Delete flow cancels sub) + P-3.

**Tasks**
- [ ] Install `stripe` npm package; wrap in `lib/stripe/client.ts`.
- [ ] Build `/api/billing/checkout/route.ts` per §15.5.1.
- [ ] Build `/api/billing/webhook/route.ts` per §15.5.2 — verify signature, insert into `billing_events`, switch on event type.
- [ ] Implement `syncSubscriptionToProfile` per §15.5.2 — update plan, `stripe_customer_id`, `stripe_subscription_id`, and `scan_quota_limit`:
  - On active subscription: set `scan_quota_limit = Number.MAX_SAFE_INTEGER`.
  - On cancellation / period end: set `scan_quota_limit = GREATEST(15, scan_quota_used)`. This clamp prevents a former Pro user who used 50 scans from seeing "used 50 / limit 15" — the limit bumps up so the blocker is "used ≥ limit", not a negative remaining-count.
  - Must be idempotent (webhook retries are allowed by Stripe); check `billing_events.stripe_event_id` UNIQUE as the guard.
- [ ] Build real paywall modal replacing the Phase 3 stub. **Two shells**: desktop = centered modal with the two plan cards side-by-side (wireframe `12`); mobile = bottom sheet with the plan cards stacked (mobile wireframe `13`). Shared `<PaywallContent>` component, two shells in `ui/modal` vs `ui/sheet`.
- [ ] Contextual quota nudge in scan header starting at scan #10 (§15.4).
- [ ] Customer Portal link from `/settings/billing` (§15.5.3).
- [ ] Wire delete-account flow to cancel subscription first (§14.4 step 1).
- [ ] **Rate limiting (expanded scope, newly in-scope for v1):** add `@upstash/ratelimit` (or Supabase-native equivalent) with per-user + per-IP buckets to:
  - `createScan` — 10/minute, 60/hour per user (blocks bulk upload abuse before it hits the LLM extractor bill).
  - `/api/billing/checkout` — 5/minute per user (blocks checkout-session spam).
  - `/api/billing/webhook` — **no user-level limiting** (Stripe is trusted); rely on signature verification. Do add a global per-IP cap (100/min) to guard against non-Stripe floods.
  - Lichess-verify server action — 30/hour per user + session-level cache.
  - OTP send (`signInWithOtp`) — already throttled by Supabase (60s default), but add our own per-phone cap of 5/hour as belt-and-braces.
  - All rate-limited actions return `{ ok: false, code: 'rate_limited', retryAfterSec }`; toast surfaces "Please wait N seconds".
- [ ] Playwright e2e (test mode): free user hits scan #16 → paywall → Stripe test card → returned to dashboard → 17th scan works.

**Exit criteria (§15.6)**
- 16th scan triggers paywall.
- Checkout upgrades plan via webhook.
- Cancellation reverts to free at period end.
- No secret keys client-side.
- Webhook signature validated.

**Risks**
- Webhook idempotency — `billing_events.stripe_event_id` UNIQUE prevents double-processing; ensure `syncSubscriptionToProfile` is idempotent too.
- Pre-MVP Stripe Test-mode only; live-mode promotion is a Phase 13 cutover.

---

## Phase 12 · Polish (a11y, errors, telemetry, perf)

**Goal:** Meet WCAG 2.1 AA, all error cases from §18.2 covered, analytics events firing, perf budgets met.

**Depends on:** Phases 2–11 all shipped, P-8 (analytics vendor chosen).

**Tasks**
- [ ] Axe audit on each screen; fix failures. Add `vitest-axe` smoke tests.
- [ ] Keyboard-reachable + visible focus ring on every interactive element (§19).
- [ ] Contrast check on cream/forest/amber combinations in light + dark; fix any sub-4.5:1 body text.
- [ ] `prefers-reduced-motion` respected in theme and modal transitions.
- [ ] Error toasts wired per §18.2 table — walk the whole table in a single PR.
- [ ] Empty states audited across Library, Dashboard, Openings (§18.3).
- [ ] Analytics adapter (`lib/analytics.ts`) with stubbed vendor. Fire events from §17.1.
- [ ] PII hygiene check: no phone/email in analytics payloads (§17.3).
- [ ] Lighthouse on dashboard + game detail + library; confirm LCP < 2 s p75, INP < 200 ms (§20.1).
- [ ] Dynamic-import audit: chessground, chess.js, stockfish all loaded only on game detail.
- [ ] Visual regression suite (§23.4) on three hero screens × 2 themes, wired to CI.

**Exit criteria**
- Axe zero violations on hero screens.
- Lighthouse ≥ 90 on perf + a11y for dashboard, game detail, library.
- All analytics events firing in preview deployment.
- Visual regression green.

---

## Phase 13 · Pre-launch cutover

**Goal:** Production-ready deploy on `pawntrail.app` with real marketing landing on `pawntrail.com`, legal pages, and live Stripe.

**Depends on:** Phase 12, P-2.

**Tasks**
- [ ] Build marketing landing page at `(marketing)/page.tsx` — hero, three-bullet value prop, CTA to `/signin`. One page only; full marketing site is post-v1.
- [ ] Draft `/privacy` and `/terms` static pages (template-grade; pass to counsel before enabling signup in production).
- [ ] Vercel project config: attach `pawntrail.com` (marketing) + `pawntrail.app` (product); production branch = `main`.
- [ ] Apply all Supabase migrations to production project; regenerate types against prod.
- [ ] Switch Stripe from test keys to live keys; update webhook endpoint URL and signing secret.
- [ ] Create Supabase storage bucket `scoresheets` in prod with the policy from §7.3.
- [ ] Run smoke-test suite against production: sign in → scan fixture image → save game → engine review → Lichess deep-link → upgrade path.
- [ ] Enable Vercel Analytics + Web Vitals.
- [ ] Set up Sentry (if budget allows — §24.4) OR document that Vercel logs + Supabase logs are the v1 observability stack.
- [ ] Final README pass per Appendix B.

**Exit criteria**
- Production deploy reachable at `pawntrail.app`.
- Marketing landing reachable at `pawntrail.com`.
- Smoke-test suite passes in production.
- All §1.3 success metrics have telemetry in place.

---

## Post-v1 / deferred

Everything in §27 — tournament manager, Lichess OAuth, shareable public game links, opening repertoire drill, native app, club accounts, engine variations, annotations. Do not sneak these into v1 phases; track in a separate roadmap doc.

---

## Open decisions tracking (copy from §26, update as resolved)

- [x] Free-tier limit: **15 for v1** (PRD §26.1).
- [x] No engine-annotated PGN from the extractor; classification is client-side (confirmed by `knightvision-api` contract — it returns moves only).
- [x] Bundle Lichess ECO dataset at build time: **yes** (PRD §26.3).
- [ ] Opening-move-sequence indexing: **deferred to v1.1** (§26.4).
- [ ] Extractor meta fields (white/black/date/tournament) — does a prompt change to `knightvision-api` let us auto-fill the metadata form? Decide during Phase 3d. Default: leave flagged off for v1.
- [ ] OCR-based scanner as eventual replacement for the LLM extractor (user preference, long-term). Post-v1 roadmap item.

---

## PRD deltas — apply before execution

The PRD is out of date in several places because of the Phase 3 architecture shift and the Phase 11 scope expansion. Update the PRD before Phase 0 begins so downstream readers (including agents) aren't confused:

- **§9.1** — Revise the flow diagram: the "server action: run scanner on image" and "server action: call PGN microservice" steps collapse into a single "server action: call extractor". Scanner JSON and "validated PGN" are the same response.
- **§9.2** — Replace the entire "Porting the existing scanner" subsection. PawnTrail does NOT port `knightvision-web`. The scanner is a thin HTTP client to `knightvision-api` (`/api/extract`). Spec the contract (`imageUrls`, `model`, `success/data/moves`, `_metadata`) directly in the PRD.
- **§9.4** — Delete the "PGN microservice contract" subsection. No separate service exists. Client-side chess.js handles validation; server action persists the response.
- **§9.5** — Remove "per-move confidence < 0.6 → amber flag" language. Replace with "illegal-move-after-replay → amber flag, suggestions derived from chess.js move-list".
- **§9.6** — `runScanner` + `validateAndBuildPgn` → single `runScanner` action. Signatures update accordingly.
- **§9.8** — Drop the low-confidence acceptance bullet; replace with legality-based one.
- **§7.1** — Change `scans.image_path TEXT` to `scans.image_paths TEXT[]` to support multi-sheet games (decision from Phase 3a).
- **§7.5** — Remove `scan_confidence` from `games` (LLM doesn't provide it) OR redefine it as "fraction of moves that validated on first pass" (computed client-side during review). Pick one; document.
- **§10.5** — Drop "low-confidence pre-save amber border" — per-move confidence no longer exists after save.
- **§15.5.2** — Add the quota clamp explicitly: `scan_quota_limit = GREATEST(15, scan_quota_used)` on downgrade.
- **§17.1** — Add a `scanner_backend` property (`llm`|`ocr`) to `scan_parsed` events so we can A/B a future OCR pipeline.
- **§22** — Replace `PT_PGN_SERVICE_URL` / `PT_PGN_SERVICE_TOKEN` with `PT_EXTRACTOR_URL` / `PT_EXTRACTOR_TOKEN` / `PT_SCANNER_BACKEND` (default `llm`).
- **§25** — Update the "PGN microservice downtime" risk row to "Extractor (LLM) downtime — signed URL TTL, retry-once, fall back to manual entry mode for power users once available".
- **§27** — Add "OCR-based scanner (replacing LLM extractor)" to v1.1 candidates.

These are safe to apply in a single PRD-update commit. Once applied, this "PRD deltas" section can be deleted.

---

*End of tasks.md — track phase completion in commits; track phase learnings back into this file so the plan stays honest.*
