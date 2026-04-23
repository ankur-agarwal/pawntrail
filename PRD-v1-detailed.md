# PawnTrail — v1 PRD (detailed)

**Status:** Ready for build · **Owner:** Ankur · **Last updated:** April 23, 2026
**Surface:** Responsive Next.js 15 web app
**Domains:** pawntrail.com (marketing) · pawntrail.app (product)
**Intended reader:** Claude Code, and the human engineer reviewing the diff

---

## 0. How to use this document

This PRD is structured so Claude Code can implement it incrementally. Each major feature has (a) a user-facing spec, (b) a technical spec with interfaces and data contracts, and (c) acceptance criteria. SQL, TypeScript types, and folder structures are given verbatim — treat the fenced code blocks as authoritative.

Build order that minimises integration pain:

1. Project scaffold → brand tokens → Supabase client → auth (§§ 4, 5, 8)
2. Data model migrations (§ 7)
3. Scan flow end-to-end with the existing scanner code ported in (§ 9)
4. Game detail with board + move list (§ 10, without engine)
5. Stockfish WASM integration, engine panel, arrow overlay (§ 10.4)
6. Library + dashboard (§§ 11, 12)
7. Settings, Lichess pairing, billing (§§ 14, 15, 16)
8. Polish pass: a11y, empty states, error toasts (§§ 18, 19)

If anything in this document contradicts the interactive design widgets rendered in the conversation, the widgets win — they reflect final UX decisions. Ask before diverging.

---

## 1. Problem and vision

### 1.1 Problem

Tournament chess players record games by hand on paper scoresheets. After the round they lose 10–15 minutes per game manually re-entering moves into Lichess or Chess.com to study them. Most skip this and never review their tournament games. The single richest source of personal improvement data — their own OTB games — goes unexamined.

### 1.2 Vision

**Snap the scoresheet. Chart the trail.**

PawnTrail turns a photo of a paper scoresheet into a PGN, an engine-reviewed game, and a Lichess-ready study in under 60 seconds. Over time, each user builds a personal searchable library of every game, opening, opponent, and lesson.

### 1.3 Success metrics (first 90 days post-launch)

| Metric | Target |
|--------|--------|
| Scan success rate (photo → PGN saved) | ≥ 85 % |
| Median time from photo to saved game | ≤ 45 s |
| Day-7 retention (signups → 2+ scans in wk 1) | ≥ 25 % |
| Free → paid conversion (users who hit scan #16) | ≥ 4 % |
| Lichess-study handoff rate | ≥ 20 % of saved games |
| Engine-review rate | ≥ 40 % of saved games get engine-reviewed within 7 days |

---

## 2. Primary user

**Ankit, rated 1600–2100 FIDE, plays 2–4 OTB tournaments per year.** He already uses Lichess for analysis. He'll try PawnTrail after his next weekend tournament if a friend shows him. He converts if the first 3 scans feel magical.

Secondary users: **parents of junior players** who transcribe games for their kids.

Non-users: beginners who don't write down moves, blitz-only players, pure online players.

---

## 3. In scope vs out of scope (v1)

### 3.1 In scope

1. Phone-OTP signup with optional email recovery
2. Scan pipeline: image upload → OCR → PGN validation → user review → save
3. Game library with search, filters, and detail view
4. Interactive board replay with keyboard navigation
5. Client-side Stockfish WASM engine with multi-PV analysis
6. PGN export and "Open in Lichess Study" deep-link
7. Freemium paywall: 15 free scans → $4.99/mo or $39/yr
8. Free-text tournament tag on each game
9. Light and dark theme; responsive layout (mobile → desktop)
10. Stripe billing with Customer Portal

### 3.2 Out of scope (deferred)

- Tournament manager with upcoming-events feed
- Native iOS / Android apps (web-only for v1)
- Social features — sharing, leaderboards, friends
- Opening repertoire trainer / flashcards
- Real-time / live blitz game entry
- Team / club accounts
- Offline mode
- Lichess OAuth (username-only handoff in v1)
- Multi-language (English only at launch)

---

## 4. Technical architecture

### 4.1 Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | SSR + server actions + edge-friendly |
| Language | TypeScript (strict) | Type safety across board state and engine protocol |
| Hosting | Vercel | Tight Next.js coupling, preview deploys |
| Auth | Supabase Auth (phone OTP, email link) | Owns SMS delivery, session cookies |
| DB | Supabase Postgres | RLS, serverless, generous free tier |
| Storage | Supabase Storage | Scoresheet image buckets, RLS-aware |
| Engine | Stockfish 16 (WASM) | Runs in browser Web Worker; zero server cost |
| Board UI | chessground + chess.js | Lichess's own board lib; battle-tested |
| Styling | Tailwind CSS + CSS variables | Utility speed + brand token theming |
| Forms | react-hook-form + zod | Validation and type inference |
| Client state | Zustand for editor state (board + engine); Server Components for data | Minimal boilerplate |
| Billing | Stripe Checkout + Customer Portal | Industry standard |
| Testing | Vitest (unit), Playwright (e2e) | Fast + cross-browser |
| CI | GitHub Actions → Vercel | Preview deploys per PR |

### 4.2 External services

- **PGN validation microservice** — existing, standalone. PawnTrail calls it from a Next.js server action. See § 9.4 for the contract.
- **Lichess** — public unauthenticated APIs only in v1. Used for username existence check and study deep-link.
- **Scanner module** — existing Next.js code, ported into this repo as a local module (see § 9.2).

### 4.3 High-level request flow

```
[Browser] ─HTTPS─▶ [Vercel / Next.js]
                    │
                    ├─▶ Server Actions ─▶ Supabase (Auth, DB, Storage)
                    │                   └─▶ PGN microservice (external)
                    │
                    └─▶ Client
                        ├─▶ Stockfish WASM (Web Worker)
                        └─▶ Supabase JS (realtime, anon key, RLS-enforced)
```

---

## 5. Brand and design tokens

The brand is "Trail" — cartographic precision. Forest is primary, amber is the single accent, cream is ground, ink is weight. Tokens below are authoritative.

### 5.1 Colors (CSS variables)

```css
:root {
  /* brand ramp */
  --pt-forest: #1F3A2E;
  --pt-forest-soft: #556B5F;   /* dark-square on chessboard, hover states */
  --pt-cream: #F4EDDC;
  --pt-cream-soft: #EBE2CE;
  --pt-amber: #C77F3A;
  --pt-amber-soft: #E0A261;    /* hover on amber CTA */
  --pt-ink: #14201A;

  /* semantic */
  --pt-bg: var(--pt-cream);
  --pt-bg-elev: rgba(20, 32, 26, 0.035);
  --pt-border: rgba(20, 32, 26, 0.14);
  --pt-border-strong: rgba(20, 32, 26, 0.26);
  --pt-text: var(--pt-ink);
  --pt-text-muted: rgba(20, 32, 26, 0.65);
  --pt-text-dim: rgba(20, 32, 26, 0.45);

  /* move classification */
  --pt-good: #2E7D5C;
  --pt-inaccuracy: #D9A04A;
  --pt-mistake: #C77F3A;
  --pt-blunder: #A94F24;
}

[data-theme="dark"] {
  --pt-bg: var(--pt-ink);
  --pt-bg-elev: rgba(244, 237, 220, 0.05);
  --pt-border: rgba(244, 237, 220, 0.14);
  --pt-border-strong: rgba(244, 237, 220, 0.26);
  --pt-text: var(--pt-cream);
  --pt-text-muted: rgba(244, 237, 220, 0.72);
  --pt-text-dim: rgba(244, 237, 220, 0.45);
}
```

### 5.2 Typography

- **Sans:** Work Sans (load weights 400, 500). Fallback: Lato, system-ui, sans-serif.
- **Serif italic:** Instrument Serif. Fallback: Georgia, serif. Used for taglines and pull-quotes only.
- **Mono:** IBM Plex Mono. Fallback: ui-monospace, 'SF Mono', Menlo, monospace. Used for eval numbers, labels, move notation.

Scale:

```
Display (H1)   28 / 34  · weight 500
H2             20 / 28  · weight 500
H3             16 / 22  · weight 500
Body           14 / 22  · weight 400
Small          12 / 18  · weight 400
Micro (labels) 10 / 14  · weight 500 · tracking 0.12em · UPPERCASE · mono
```

### 5.3 Spacing and radii

8-pt grid: `4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96`.
Radii: `4` (chip, small pill), `6` (card), `8` (large card), `12` (frame), `pill: 9999`.
Borders: `0.5px solid var(--pt-border)` default; `0.5px solid var(--pt-border-strong)` for emphasis.

### 5.4 Brand assets (already in repo)

```
/public/brand/
  trail-mark.svg                 # master mark (vector)
  trail-mark.png                 # 1600×1600 raster
  trail-lockup-horizontal.svg    # mark + wordmark
  trail-concept-card.png
  trail-favicon-{16,32,64,128,256,512}.png
  favicon.ico                    # compiled from 16/32/48 pngs
  og-image.png                   # 1200×630 concept card
```

Generated by `/scripts/generate_trail_brand.py`. Do not ship the Python script to Vercel — it's a dev-time asset pipeline.

### 5.5 Component tokens (Tailwind)

Configure `tailwind.config.ts` with the brand palette plus semantic aliases. Full snippet in § 21.2.

---

## 6. Information architecture

### 6.1 Routes

```
/                         marketing landing (pawntrail.com)
/signin                   phone entry
/verify                   OTP entry
/setup                    first-run: optional recovery email
/dashboard                authed home
/scan                     new scan: upload
/scan/[scanId]/review     review & edit parsed moves
/games                    library (table view)
/games/[gameId]           game detail / editor
/openings                 openings aggregated view
/settings                 account + billing + Lichess + theme
/settings/billing         Stripe-managed
/privacy                  static
/terms                    static
```

### 6.2 Layouts

- `(marketing)/layout.tsx` — cream background, top nav with sign-in CTA, no auth.
- `(auth)/layout.tsx` — cream background, small brand mark top-left, card-centered form.
- `(app)/layout.tsx` — topbar + sidebar + main, session required, light/dark class on `<html>`.

### 6.3 Navigation (authed)

Sidebar items (in order): **Dashboard · Scan sheet · Library · Openings · Settings**. Plus a quota meter pinned at the bottom of the sidebar showing `free_scans_used / free_scans_limit` (hidden if user is on a paid plan).

---

## 7. Data model

All tables live in the default Supabase `public` schema. UUID primary keys. Created/updated timestamps default to `now()`. Foreign keys cascade on delete (scans/games/moves belong to a user — if the user deletes their account, everything goes).

### 7.1 SQL schema

```sql
-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- users
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  phone             text not null,                     -- E.164, e.g. +919812345678
  email             citext,                            -- optional recovery
  display_name      text,
  lichess_username  text,                              -- verified at set time
  plan              text not null default 'free',      -- 'free' | 'pro_monthly' | 'pro_yearly'
  stripe_customer_id text,
  stripe_subscription_id text,
  scan_quota_used   integer not null default 0,
  scan_quota_limit  integer not null default 15,
  theme             text not null default 'system',    -- 'light' | 'dark' | 'system'
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index profiles_phone_idx on public.profiles (phone);
create index profiles_email_idx on public.profiles (email);

-- games
create table public.games (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  played_on          date,
  opponent_name      text,
  opponent_rating    integer,
  color              text check (color in ('white','black')),
  result             text check (result in ('win','loss','draw','unknown')),
  eco_code           text,                              -- e.g. 'E21'
  opening_name       text,                              -- e.g. 'Nimzo-Indian, Three knights'
  time_control       text,                              -- free text e.g. '90+30'
  tournament_name    text,
  round              text,
  pgn                text not null,                     -- canonical PGN
  scan_id            uuid references public.scans(id) on delete set null,
  scan_image_path    text,                              -- Supabase storage key
  scan_confidence    numeric(4,3),                      -- 0.000–1.000
  engine_reviewed_at timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index games_user_played_idx   on public.games (user_id, played_on desc);
create index games_user_eco_idx      on public.games (user_id, eco_code);
create index games_user_opponent_idx on public.games (user_id, opponent_name);
create index games_user_tournament_idx on public.games (user_id, tournament_name);

-- moves (denormalized for fast eval graph + classification queries)
create table public.moves (
  id              uuid primary key default uuid_generate_v4(),
  game_id         uuid not null references public.games(id) on delete cascade,
  ply             integer not null,                     -- 1 = first white move
  san             text not null,                        -- 'Nf3'
  fen_after       text not null,
  eval_cp         integer,                              -- centipawns from white perspective; null until engine reviews
  best_move_san   text,
  classification  text check (classification in ('book','good','inaccuracy','mistake','blunder')),
  created_at      timestamptz not null default now()
);

create unique index moves_game_ply_idx on public.moves (game_id, ply);

-- scans (audit trail + mid-flow resume)
create table public.scans (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  image_path      text not null,                        -- Supabase storage key
  status          text not null default 'pending'
                  check (status in ('pending','parsing','parsed','edited','saved','failed')),
  raw_ocr_json    jsonb,                                -- full scanner output
  error           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index scans_user_status_idx on public.scans (user_id, status);

-- billing events (webhook sink, append-only)
create table public.billing_events (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete set null,
  stripe_event_id text unique not null,
  event_type      text not null,                        -- 'checkout.session.completed' etc.
  payload         jsonb not null,
  received_at     timestamptz not null default now()
);
```

### 7.2 Row-level security

Every table (except `billing_events` which is service-role only) has RLS enabled with a single rule: `user_id = auth.uid()`.

```sql
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.moves enable row level security;
alter table public.scans enable row level security;
alter table public.billing_events enable row level security;

create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy games_self on public.games
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy moves_self on public.moves
  for all using (
    exists (select 1 from public.games g where g.id = moves.game_id and g.user_id = auth.uid())
  );

create policy scans_self on public.scans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- billing_events: service_role only (no policy for anon/authenticated)
```

### 7.3 Storage

Two buckets:

- `scoresheets` (private, RLS-aware) — raw scan images, keyed by `{user_id}/{scan_id}.jpg`.
- `brand` (public, read-only) — if we ship user-visible share images in the future.

Storage RLS policy (Supabase Storage SQL):

```sql
create policy "own scoresheet read/write" on storage.objects for all
  using (bucket_id = 'scoresheets' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'scoresheets' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 7.4 Derived / cached values

`profiles.scan_quota_used` is incremented in a transaction when a scan is successfully saved into a game (status='saved'). It is NOT decremented on delete — a scan consumed is consumed. Enforced via a Postgres trigger:

```sql
create or replace function public.inc_scan_quota()
returns trigger language plpgsql security definer as $$
begin
  if (new.status = 'saved' and old.status is distinct from 'saved') then
    update public.profiles set scan_quota_used = scan_quota_used + 1 where id = new.user_id;
  end if;
  return new;
end $$;

create trigger scans_quota_trg
  after update on public.scans
  for each row execute procedure public.inc_scan_quota();
```

### 7.5 TypeScript types

Auto-generate with the Supabase CLI:

```bash
npx supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts
```

Then a thin wrapper in `lib/supabase/helpers.ts` re-exports typed `Game`, `Move`, `Scan`, `Profile`.

---

## 8. Authentication

### 8.1 Flow overview

1. User enters phone number → Supabase sends SMS OTP
2. User enters 6-digit code → Supabase validates, creates session
3. On first sign-in, user is routed to `/setup` (optional recovery email)
4. Subsequent logins skip `/setup` and land on `/dashboard`
5. Session persists via httpOnly cookie (Supabase Auth Helpers for Next.js)
6. Sign-out clears the cookie and redirects to `/signin`

### 8.2 Screens

#### 8.2.1 `/signin` — phone entry

- Brand mark + wordmark centered
- Serif italic tagline: *"Snap the scoresheet. Chart the trail."*
- Country code selector (default `+91 · IN`, full list of ISO country codes)
- Phone number input (E.164-normalised client-side)
- Primary button "Send verification code"
- Fine print: *"We'll text a 6-digit code. Standard carrier rates may apply. By continuing you agree to the Terms and Privacy policy."*
- Secondary link: "Using a landline, or travelling? Sign in with email →" (routes to `/signin/email`, v1.1 — in v1, show "Coming soon" toast)

#### 8.2.2 `/verify` — OTP entry

- Back link: "Change number" → `/signin`
- Title: "Enter the 6-digit code"
- Subtitle showing masked phone: `sent to +91 98xxx xx432`
- Six separate digit input boxes, monospace, auto-advance on input, backspace jumps back, paste splits across boxes
- Expiry countdown in amber: `Code expires in 09:42`
- Primary button "Verify and continue"
- Resend link: starts disabled with countdown `Resend in 00:38`, activates after 60 s, amber text when active

#### 8.2.3 `/setup` — first-run setup

Shown only when `profiles.email IS NULL`.

- Greeting: "You're in, Ankit." (first name from display_name, else "you're in")
- Tagline: *"Before your first scan — one small favour."*
- Illustration strip: Trail mark + email → "Always in. Even if your SIM changes."
- Recovery email input (pre-filled if Supabase Auth already has an email from the OAuth session — not the case in v1 but leave the hook)
- Primary button "Save email and continue" → updates `profiles.email`, routes to `/dashboard`
- "Skip for now" link → routes to `/dashboard` without persisting anything
- Progress dots: step 2 of 2 (step 1 being OTP verify)

#### 8.2.4 Lichess pairing prompt (modal, contextual)

Shown the first time the user clicks "Open in Lichess" on any game detail view. Not part of signup.

- Union mark at top: Trail favicon + `+` + `li` (Lichess brand block)
- Title: "Pair with Lichess"
- Subtitle: *"Send any game straight to a Lichess study — one tap from game detail."*
- Three bullets: (a) your games open in your account, not a shared link; (b) no OAuth, no password; (c) change or remove it any time from Settings
- Username input prefixed by `@` (visually a two-part control with a locked prefix)
- Fine print: "We'll verify the handle exists before saving."
- Primary button "Verify and pair"
- Secondary link "I'll decide later" → closes modal, does NOT set username

### 8.3 Implementation notes

```ts
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts (server components / actions)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function getServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
      },
    }
  )
}
```

Sending OTP:

```ts
await supabase.auth.signInWithOtp({ phone: '+919812345678' })
```

Verifying:

```ts
await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

On success, the session cookie is set automatically. Use `middleware.ts` to guard `/app/(app)/*` and redirect unauth'd users to `/signin`.

### 8.4 Edge cases

- **Phone already in use** — Supabase treats it as the same user (sign-in, not sign-up). Confirm with user via UI language: the primary button says "Send verification code" regardless of whether this is a new or returning user.
- **Rate limiting** — Supabase enforces its own OTP throttle (default 60s between sends). Surface as: "Please wait Ns before requesting another code."
- **SMS not received** — resend active after 60s; if still no code, show secondary: "Still nothing? [Try a different number] or [Contact support]".
- **Session expiry** — Supabase refresh tokens last 30 days; silent refresh in middleware. On expiry, redirect to `/signin` with `?redirect=<path>`.

### 8.5 Acceptance criteria

- [ ] Phone OTP sign-in creates `profiles` row on first verify via a Postgres trigger on `auth.users`.
- [ ] Session cookie is httpOnly and `Secure` in production.
- [ ] `/app/(app)/*` routes are unreachable without a session (middleware-enforced 302 to `/signin`).
- [ ] Setting Lichess username hits `GET https://lichess.org/api/user/{username}` and rejects 404.
- [ ] "Change number" on `/verify` clears the draft and returns to `/signin`.
- [ ] OTP paste splits correctly across the 6 boxes.

---

## 9. Scan flow

### 9.1 End-to-end flow

```
[/scan] ─ user picks or captures image ────────────────────────┐
                                                                ▼
                                            client-side compress (jpg, ≤1MB, maxdim 2000)
                                                                │
                                                                ▼
                                            upload to supabase.storage (scoresheets/{uid}/{scanId}.jpg)
                                                                │
                                                                ▼
                                            server action: create scan row (status=pending)
                                                                │
                                                                ▼
                                            server action: run scanner on image → raw OCR JSON
                                                                │   (status=parsing → parsed | failed)
                                                                ▼
                                            server action: call PGN microservice with OCR JSON
                                                                │
                                                                ▼
                                            redirect to /scan/{scanId}/review
                                                                │
                                                                ▼
                                            user confirms / edits moves + metadata
                                                                │
                                                                ▼
                                            server action: save as game (status=saved, moves populated)
                                                                │
                                                                ▼
                                            redirect to /games/{gameId}
```

### 9.2 Porting the existing scanner

Existing scanner is a Next.js module. Place it under `/lib/scanner/`:

```
/lib/scanner/
  index.ts              # public API
  model/                # onnx or tflite model files
  preprocess.ts
  detect.ts
  transcribe.ts
  types.ts
```

Public interface:

```ts
// lib/scanner/types.ts
export interface ScannerRawResult {
  moves: Array<{
    ply: number            // 1-indexed
    san: string | null     // null = unreadable cell
    confidence: number     // 0..1
    bbox?: [number, number, number, number]  // optional for debug overlay
  }>
  meta?: {
    white?: string
    black?: string
    result?: string
    date?: string
    tournament?: string
    round?: string
  }
  confidenceOverall: number
}

// lib/scanner/index.ts
export async function scanImage(buffer: Buffer): Promise<ScannerRawResult>
```

Run it in a **Node server action** (not edge — ONNX runtime needs Node). Expose via `app/scan/actions.ts`.

### 9.3 Upload component (`app/scan/page.tsx`)

- Drag-and-drop zone OR click-to-select
- Mobile camera capture: `<input type="file" accept="image/*" capture="environment" />`
- Client-side compression before upload:

```ts
// lib/images/compress.ts
export async function compressImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file)
  const maxDim = 2000
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const canvas = new OffscreenCanvas(img.width * scale, img.height * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.82 })
}
```

- Tips shown below the drop zone: "Well-lit · full sheet in frame · straight-on angle".
- Progress state: uploading → parsing (poll scan status every 2s) → redirect on `parsed`.

### 9.4 PGN microservice contract

The scoresheet scanner produces a list of moves that may contain invalid or ambiguous entries. The PGN microservice takes the raw scanner output and returns a canonical PGN plus a per-move confidence map.

**Request:**

```http
POST https://pgn-service.pawntrail.app/v1/validate
Authorization: Bearer <PT_PGN_SERVICE_TOKEN>
Content-Type: application/json

{
  "scanId": "uuid",
  "moves": [
    { "ply": 1, "san": "e4", "confidence": 0.98 },
    { "ply": 2, "san": "c5", "confidence": 0.91 },
    ...
  ],
  "meta": { "white": "...", "black": "...", "result": "1-0", ... }
}
```

**Response 200:**

```json
{
  "pgn": "[Event \"...\"]\n1. e4 c5 2. Nf3 ...",
  "moves": [
    {
      "ply": 1,
      "san": "e4",
      "fen_after": "rnbqkbnr/pppppppp/...",
      "confidence": 0.98,
      "valid": true,
      "corrected": false
    },
    ...
  ],
  "eco_code": "B40",
  "opening_name": "Sicilian Defence",
  "needsReview": false
}
```

**Response 4xx** for malformed input, `5xx` for service error, both surfaced to user as "Couldn't read that sheet — retry with a clearer photo".

Call this from a server action, **not** from the client — the bearer token must never reach the browser.

### 9.5 Review & edit screen (`/scan/[scanId]/review`)

Layout:

```
[topbar]
[sidebar | main]

main:
  [breadcrumb: Scan › Review]
  [flex row]
    [board (chessground, click-to-correct)]
    [original sheet preview (zoomable)]
    [move list (with per-move confidence flags)]
  [metadata form: opponent, color, result, tournament, round, date]
  [primary: Save game · secondary: Back to scan]
```

Behaviour:

- Every move where `confidence < 0.6` is flagged amber ("⚠"), clickable to correct. Correction UI: clicking an amber move pops a small inline suggestion list from the PGN microservice (top 3 plausible moves).
- User can drag pieces on the board to set a corrected position; chess.js validates legality; if legal, the move's SAN is rewritten and subsequent moves auto-revalidate against the new position.
- Original sheet preview loads from Supabase storage; pinch-zoom on mobile, click-to-zoom on desktop.
- Metadata form auto-fills from scanner `meta` where available.
- Save button disabled until all moves are valid AND all amber flags resolved (auto-resolve after edit).

### 9.6 Server actions

```ts
// app/scan/actions.ts
'use server'

export async function createScan(imageBlob: Blob): Promise<{ scanId: string }>
export async function runScanner(scanId: string): Promise<void>           // updates status → parsing → parsed
export async function validateAndBuildPgn(scanId: string): Promise<void>  // calls PGN service
export async function saveScanAsGame(scanId: string, metadata: GameMetadataInput): Promise<{ gameId: string }>
```

### 9.7 Paywall enforcement

Check `profiles.scan_quota_used < profiles.scan_quota_limit` at the `createScan` server action. If exceeded:
- Return `{ error: 'quota_exceeded' }` instead of throwing.
- Client shows a full-screen paywall modal (see § 15.3).

### 9.8 Acceptance criteria

- [ ] Upload a 5 MB photo → client compresses to < 1 MB before upload.
- [ ] Server action correctly transitions scan status: pending → parsing → parsed → saved.
- [ ] Low-confidence moves (< 0.6) render with amber flag and are clickable to correct.
- [ ] Dragging a piece to correct a move updates subsequent-move validity.
- [ ] Save button is disabled while any move is invalid.
- [ ] On save, `games`, `moves`, and `profiles.scan_quota_used` all update atomically (Postgres function or RPC).
- [ ] Quota-exceeded returns the paywall modal, not a scan.

---

## 10. Game detail and engine

This is the most complex screen in the app. See the interactive widget titled "02 · Game detail — with Stockfish engine lines" for the final visual reference.

### 10.1 Screen layout (desktop ≥ 1024px)

```
[topbar]
[sidebar | main]

main:
  [breadcrumb + action buttons: Flip | Share PGN | Open in Lichess]
  [row 1]
    [eval bar 14px | board (chessground) | right rail]
      right rail:
        [engine panel]         ← top, ~40 %
        [move list]            ← bottom, scrollable, ~60 %
  [row 2]
    [evaluation graph, full width]
  [row 3]
    [move review card | opening card | opponent card | original sheet thumb]
```

### 10.2 Mobile layout (< 768px)

Stacks vertically; the engine panel and move list become tabs in a segmented control above the eval graph. Board stays full-width with eval bar on the left edge.

### 10.3 Board (chessground)

- Use `@lichess-org/chessground` for board rendering.
- Use `chess.js` to maintain position state and validate moves.
- Keyboard navigation: `←` / `→` step moves; `Home` / `End` jump to start / end; `↑` / `↓` for variations (reserved for v1.1).
- Flip board toggles `orientation: 'white' | 'black'`.
- Piece theme: default chessground, but recolor squares via CSS vars (`--pt-cream` light, `--pt-forest-soft` dark).

### 10.4 Engine integration (Stockfish WASM)

#### 10.4.1 Worker setup

```ts
// lib/stockfish/worker.ts
// This file is bundled as a Web Worker.
importScripts('/stockfish/stockfish.wasm.js')

const sf = new Module.Stockfish()
sf.addMessageListener((line: string) => postMessage({ type: 'uci', line }))

onmessage = (e: MessageEvent<{ cmd: string }>) => {
  sf.postMessage(e.data.cmd)
}
```

Put the Stockfish WASM binary and loader at `/public/stockfish/` — they ship as static assets, zero server cost.

#### 10.4.2 Client-side engine hook

```ts
// hooks/useEngine.ts
export interface EngineLine {
  rank: number         // 1-based, rank-1 = top line
  scoreCp: number      // centipawns from white perspective; mate scores are ±100000 + distance
  depth: number
  pv: string[]         // SAN move sequence
}
export interface EngineState {
  running: boolean
  depth: number         // current depth
  targetDepth: number   // UI-selected max
  nps: number
  lines: EngineLine[]   // length === multiPV
}

export function useEngine(fen: string, opts: { multiPV: number; targetDepth: number; threads: number }): EngineState & { pause(): void; resume(): void }
```

Under the hood: parse `info depth N multipv K score cp X pv ...` lines from Stockfish UCI output. Maintain an internal map keyed by `multipv`; replace entries as deeper info arrives. Emit state via `useSyncExternalStore` for low-latency updates without re-rendering the whole tree.

#### 10.4.3 Engine panel UX

Visual spec is in the design widget. Interactions:

- Header live dot pulses while engine is running; solid when paused.
- "Depth 30 ▾" chip opens a dropdown: 18, 22, 26, 30, 34. Default 22 on mobile, 30 on desktop.
- "Lines 3 ▾" chip offers 1 / 3 / 5. Default 3.
- "Threads 2 ▾" chip offers 1, 2, 4 (capped by `navigator.hardwareConcurrency`).
- Clicking an engine line plays its PV forward on the board as a ghost preview (semi-transparent pieces). Clicking again exits preview.
- Top line's first move is rendered as an amber arrow overlay on the board when the "Arrow on board" toggle is on.

#### 10.4.4 Arrow overlay

```
component: <BoardArrow fromSquare="a4" toSquare="c2" color="amber" />
```

Implementation: SVG overlay absolutely positioned over the board wrapper. Compute pixel coords from square notation using board bounding rect. Use an SVG `<marker>` for the arrowhead, semi-transparent stroke at 0.82 opacity.

#### 10.4.5 Persistence

- When the game was first saved, all moves have `eval_cp = null`. On first opening the game detail page, kick off a background "full game review" pass:

```
for each ply from 1 to N:
  set fen = moves[ply].fen_after
  run engine at depth 18, multiPV=1
  write back: moves[ply].eval_cp, best_move_san, classification
```

Do this in the client (Web Worker) to avoid server cost. Classify by delta from prior-move eval:

| Delta (cp) | Classification |
|------------|----------------|
| ≤ 30 | good |
| 30–80 | inaccuracy |
| 80–200 | mistake |
| > 200 | blunder |

Moves played within "book" are classified as `book`. Use Lichess's opening book via the chess.js ECO dataset (bundled) for the first 8 plies of known openings.

Write the results back with `supabase.from('moves').update(...)`. Update `games.engine_reviewed_at` when complete.

#### 10.4.6 Eval graph

- Line chart of `moves[].eval_cp` from ply 1 to N.
- X-axis: ply. Y-axis: eval clamped to [-600, 600] cp (for readability). Mates render at the clamp edge.
- Zero line dashed.
- Blunder markers: amber dot at each ply where `classification = 'blunder'`.
- Clicking a point seeks the board to that ply.
- Responsive width; fixed 62 px tall.

### 10.5 Move list

- Grid 3-column: move-number, white move, black move.
- Monospace font, 10 px.
- Current-ply highlighted: white-move cell forest bg, cream text.
- Low-confidence moves (pre-save scan) render with amber border and `⚠` suffix.
- Click a cell to seek board to that ply.
- Scroll container max-height 260 px.
- Scroll-into-view when keyboard navigating moves.

### 10.6 Action bar (top-right)

- **Flip** — toggle board orientation; persists for the session.
- **Share PGN** — opens dropdown: Copy to clipboard · Download .pgn · Copy share link (link to a public read-only view, v1.1).
- **Open in Lichess** — if `lichess_username` is set, POSTs to Lichess study import; else opens the Lichess pairing modal (§ 8.2.4). After pairing, continues the action.

### 10.7 Lichess deep-link

```ts
// lib/lichess/openInStudy.ts
export async function openInLichessStudy(pgn: string, username: string) {
  // v1: open the import PGN page pre-filled via URL param
  const url = `https://lichess.org/paste?pgn=${encodeURIComponent(pgn)}`
  window.open(url, '_blank', 'noopener')
}
```

In v1.1, swap to the Lichess API: `POST /api/study/{studyId}/chapter` with the user's OAuth token. For v1, the paste-URL approach requires zero OAuth and works for every user.

### 10.8 Acceptance criteria

- [ ] Engine starts automatically on page load and runs to target depth.
- [ ] Changing depth / multiPV / threads restarts the engine with new params.
- [ ] Arrow overlay on board matches top line's first move.
- [ ] Clicking an engine line plays its PV on board as ghost preview.
- [ ] Eval graph renders all plies with correct centipawns.
- [ ] Blunder markers correctly highlight classified blunders.
- [ ] "Open in Lichess" triggers pairing modal on first use, succeeds on second use.
- [ ] Full-game review runs in background and persists `eval_cp` + classification to DB.
- [ ] Keyboard navigation (←/→/Home/End) works on desktop.
- [ ] Pauses engine when tab is backgrounded (use Page Visibility API).

---

## 11. Library

### 11.1 Screen (`/games`)

```
[topbar]
[sidebar | main]

main:
  [filter bar]
  [table of games, paginated or virtualised]
  [footer count + "Load more" button]
```

### 11.2 Filter bar

- Search input (placeholder: "Search opponent, opening, tournament…") — fuzzy match against `opponent_name`, `opening_name`, `tournament_name`.
- Date-range chip (defaults to "Last 90 days") — opens a popover with presets: 7d, 30d, 90d, 1y, all, custom.
- Result chip — all / win / loss / draw.
- Color chip — any / white / black.
- Opening chip — dropdown of ECO codes grouped A/B/C/D/E.
- "Flagged only" toggle — shows games where any `moves.classification = 'blunder'`.
- Right-aligned: game count (`47 games`).

### 11.3 Table columns

| Col | Width | Content |
|-----|-------|---------|
| Date | 70 | `Apr 12` |
| Opponent | 1fr | avatar initials + name + rating |
| Clr | 30 | white/black dot |
| Result | 90 | pill (win/loss/draw) |
| Opening | 1fr | opening name + ECO |
| Eval trace | 80 | sparkline SVG |
| Tournament | 1fr | tournament name · round |

Click a row → navigates to `/games/{gameId}`.

### 11.4 Data fetching

Server component fetches the first page (25 rows) at render time. Client-side infinite scroll for subsequent pages. Use a keyset-pagination cursor on `(played_on, id)` for stable ordering.

```ts
// app/games/page.tsx
export default async function LibraryPage({ searchParams }: { searchParams: LibraryFilters }) {
  const games = await listGames(searchParams)
  return <LibraryClient initial={games} filters={searchParams} />
}
```

### 11.5 Acceptance criteria

- [ ] Search is debounced at 250 ms.
- [ ] Filters are reflected in URL query params (deep-linkable).
- [ ] Clicking a row opens the game detail page without a full reload.
- [ ] Empty state shows when no games match: "No games match these filters. Try widening the date range." + "Scan your first game" CTA if library is empty overall.
- [ ] Sparkline encodes `moves.eval_cp` trajectory correctly.

---

## 12. Dashboard

### 12.1 Screen (`/dashboard`)

```
main:
  [greeting + subtitle]
  [scan CTA card, forest bg]
  [4 metric cards]
  [recent games table — 5 rows]
  [optional: openings summary, v1.1]
```

### 12.2 Greeting

`Welcome back, {display_name || 'Ankit'}`. Subtitle: `You've scanned {scan_quota_used} games across {distinct_tournaments} tournaments. {rating_delta_sign}{rating_delta} Elo over the last 90 days.`

Rating delta requires a `rating_events` table that we skip in v1 — for v1, omit the Elo segment if no data.

### 12.3 Metric cards

Four cards, 2×2 on narrow viewports, 1×4 on wide:

- **Games** — count, subtitle: `since {first_game_date}`
- **Win rate** — percentage, subtitle: `last 30 days`
- **Rating** — current rating (user-editable in Settings for v1), subtitle: `{delta} over 90d` (if available)
- **Blunders/game** — mean blunders across games engine-reviewed, subtitle: previous-period comparison

The "Rating" card has `.accent` styling (amber number) to make it the eye-catcher.

### 12.4 Scan CTA card

- Forest background, cream text
- Title: "Scan your next scoresheet"
- Subtitle: "Snap a photo. We'll parse, analyse, and save the game in under a minute."
- Amber button "Scan sheet →" → routes to `/scan`

### 12.5 Recent games

Identical styling to library table but capped at 5 rows, no filters, footer link "Show all ↗" → `/games`.

### 12.6 Acceptance criteria

- [ ] First-time users (no games) see an empty-state dashboard with a hero "Scan your first game" and illustrated onboarding row.
- [ ] Metric cards refresh on navigation back from game detail.
- [ ] All tiles use real data; no placeholder numbers in production.

---

## 13. Openings (brief v1)

A minimal v1 surface: a single table listing openings the user has played, with aggregated stats. Full "openings explorer" with drill-down is v1.1.

```
main:
  [title + optional search]
  [table columns: opening, ECO, games, win rate, avg eval delta]
```

Rows derived from:

```sql
select opening_name, eco_code, count(*) as games,
       sum(case when result = 'win' then 1 else 0 end)::float / count(*) as win_rate,
       avg((select avg(abs(eval_cp)) from moves where game_id = games.id)) as avg_eval_delta
from games
where user_id = auth.uid()
group by opening_name, eco_code
order by games desc;
```

Acceptance: top 3 openings by game count are highlighted with an amber badge. Clicking an opening filters the library by ECO code.

---

## 14. Settings

### 14.1 Screen (`/settings`)

Sections, each a card:

- **Account** — display name, phone (read-only), recovery email (editable)
- **Lichess** — username with verify button, "Remove" link
- **Theme** — system / light / dark radio
- **Billing** — plan label, "Manage subscription" → Stripe Customer Portal, quota bar
- **Data** — "Export all games as PGN" (downloads concatenated PGN), "Delete my account" (destructive, confirmation modal)

### 14.2 Lichess verify

```ts
async function verifyLichess(username: string): Promise<boolean> {
  const res = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`)
  return res.status === 200
}
```

On success, update `profiles.lichess_username`. On 404, show inline error.

### 14.3 Theme

Write `profiles.theme` server-side AND set a cookie `pt-theme` for first-paint application in the layout:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = cookies().get('pt-theme')?.value ?? 'system'
  return <html lang="en" data-theme={theme}>...</html>
}
```

`system` theme reads `prefers-color-scheme` via CSS `@media` queries.

### 14.4 Delete account

Confirmation modal requires the user to type `DELETE`. On confirm, call a server action that:

1. Cancels Stripe subscription via `stripe.subscriptions.cancel()`
2. Deletes `profiles` row — CASCADE wipes games, moves, scans
3. Deletes storage objects under `scoresheets/{user_id}/`
4. Calls `supabase.auth.admin.deleteUser(userId)`
5. Signs the user out

### 14.5 Acceptance criteria

- [ ] Phone number is read-only in v1 (changing phone requires support).
- [ ] Lichess username verified against Lichess before save; bad handle shows inline error.
- [ ] Theme persists across sessions via cookie + profile.
- [ ] Account deletion is irreversible and wipes all user data including storage.

---

## 15. Billing / paywall

### 15.1 Plans

| Plan | Price | Scans | Stripe price ID env |
|------|-------|-------|---------------------|
| Free | $0 | 15 lifetime | — |
| Pro monthly | $4.99 / mo | unlimited | `STRIPE_PRICE_PRO_MONTHLY` |
| Pro yearly | $39 / yr (34 % off) | unlimited | `STRIPE_PRICE_PRO_YEARLY` |

### 15.2 Paywall trigger

Server-side at `createScan`:

```ts
if (profile.plan === 'free' && profile.scan_quota_used >= profile.scan_quota_limit) {
  return { error: 'quota_exceeded' }
}
```

Client shows paywall modal.

### 15.3 Paywall modal

- Title: "You've scanned 15 games — nice work."
- Sub: "Keep going with Pro. Unlimited scans, priority OCR, same everything else."
- Two plan cards: monthly (outlined) vs yearly (accented, "34% off" badge)
- Primary button per card: "Upgrade to Pro — monthly/yearly" → Stripe Checkout
- Below: "Questions? support@pawntrail.app"
- Secondary link: "Not now" → closes modal, back to dashboard

### 15.4 Quota counter (contextual nudge)

Starting at scan #10, show a small amber counter in the scan-flow header:

> "You've used 10 of 15 free scans. Pro is $4.99/mo. [Upgrade]"

Non-blocking; small; disappears after upgrade.

### 15.5 Stripe integration

#### 15.5.1 Checkout

```ts
// app/api/billing/checkout/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { priceId } = await req.json()
  const profile = await getCurrentProfile()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: profile.stripe_customer_id ?? undefined,
    customer_email: profile.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=cancelled`,
    subscription_data: { metadata: { user_id: profile.id } },
  })
  return NextResponse.json({ url: session.url })
}
```

#### 15.5.2 Webhook

```ts
// app/api/billing/webhook/route.ts
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const rawBody = await req.text()
  const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  await supabaseServiceRole.from('billing_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as any,
    user_id: (event.data.object as any)?.metadata?.user_id ?? null,
  })

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscriptionToProfile(event)
      break
  }
  return NextResponse.json({ received: true })
}
```

`syncSubscriptionToProfile` updates `profiles.plan`, `stripe_customer_id`, `stripe_subscription_id`, and (for active subs) resets `scan_quota_limit` to `Number.MAX_SAFE_INTEGER`.

#### 15.5.3 Customer Portal

Link from Settings → Billing:

```ts
const portal = await stripe.billingPortal.sessions.create({
  customer: profile.stripe_customer_id,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
})
```

### 15.6 Acceptance criteria

- [ ] Free user cannot create a 16th scan; paywall modal appears.
- [ ] Successful checkout upgrades `plan` to `pro_monthly` or `pro_yearly` via webhook.
- [ ] Cancellation (via Customer Portal) reverts `plan` to `free` at period end (webhook-driven).
- [ ] No secret keys ever reach the client. Use `STRIPE_SECRET_KEY` server-side only.
- [ ] Webhook signature verified; invalid signatures return 400.

---

## 16. Lichess integration

Covered in § 8.2.4 (pairing) and § 10.7 (deep-link). v1 is username-only, paste-URL based — no OAuth.

Rate limit: Lichess caps user-info API calls. Cache username existence checks client-side for the session.

---

## 17. Analytics & telemetry

### 17.1 Events

Use PostHog (or similar) with a server-side identify on sign-in. Events:

| Event | Properties |
|-------|-----------|
| `signup_completed` | method=phone |
| `scan_uploaded` | size_kb, device_type |
| `scan_parsed` | duration_ms, confidence_overall |
| `scan_reviewed` | edits_count |
| `scan_saved` | duration_total_ms |
| `engine_started` | depth, multiPV |
| `lichess_opened` | pair_on_first_use |
| `paywall_shown` | scan_count |
| `checkout_started` | plan |
| `subscription_activated` | plan |

### 17.2 Performance telemetry

- Web vitals (LCP, INP, CLS) via `next/analytics`.
- Scan flow funnel tracked explicitly.
- Engine crash / WASM-not-supported events.

### 17.3 PII hygiene

Do NOT send phone or email to analytics. Use Supabase user ID only.

---

## 18. Error handling and edge cases

### 18.1 Global patterns

- All server actions return `{ ok: true, data }` or `{ ok: false, error: string, code?: string }`. Never throw to client.
- Toasts via `sonner`. Error toasts amber, success toasts forest, info toasts neutral.
- 4xx → friendly message + retry. 5xx → "Something went wrong" + "Reload" button.

### 18.2 Specific cases

| Case | Handling |
|------|----------|
| Scanner returns 0 moves | "Couldn't read any moves from that image — try a clearer photo." |
| PGN service times out (>20s) | Retry once; then surface error with "Report this scan" link |
| Stockfish WASM fails to load | Hide engine panel, show: "Engine unavailable on this device." |
| Lichess API 5xx during verify | Allow user to save unverified with warning: "We couldn't reach Lichess right now — we'll retry later." |
| Supabase row not found | 404 page with breadcrumb back to library |
| Session expired mid-action | Silent refresh; on failure, toast "Session expired — please sign in again" + redirect |
| Paste into OTP with non-digits | Strip non-digits, distribute across boxes |
| User tries to upload non-image | Block at `<input accept>`, toast "We only support JPEG, PNG, and WebP." |
| Image > 10 MB | Block client-side, toast with max size info |

### 18.3 Empty states

Every list view has a first-time empty state AND a filtered empty state. Examples:

- **Library (no games)**: big illustrated empty state with "Scan your first game" CTA.
- **Library (filter empty)**: "No games match these filters." + "Clear filters" link.
- **Dashboard (no games)**: focus on scan CTA, hide metric cards that would show zeros.

---

## 19. Accessibility

Target WCAG 2.1 AA.

- All interactive elements keyboard-reachable with visible focus ring (2 px forest, `outline-offset: 2px`).
- Color contrast ≥ 4.5:1 for body text against its background (verify cream-on-forest and ink-on-cream combinations).
- Amber on cream is borderline — never use amber for body text; use it for accents only. Body copy is ink or forest.
- Every form input has an associated `<label>`.
- OTP input group has `aria-label="Verification code"` on the wrapper.
- Board is keyboard-navigable; moves and buttons have accessible names.
- Theme toggle respects `prefers-reduced-motion` — skip transitions.
- Dark mode verified for contrast.

---

## 20. Performance

### 20.1 Budget

| Metric | Target |
|--------|--------|
| LCP (dashboard, p75) | < 2.0 s |
| INP | < 200 ms |
| JS transferred (first load, app routes) | < 200 KB gzipped |
| Stockfish WASM size | ~2 MB gzip — lazy-loaded only on game-detail pages |
| Image compression (client) | JPEG quality 0.82, max 2000 px |

### 20.2 Strategies

- Dynamic `import()` for chessground, chess.js, stockfish — only loaded on game-detail route.
- Supabase queries use select-specific columns; no `select *` in production.
- Virtualise library table past 100 rows (`@tanstack/react-virtual`).
- Cache Stockfish WASM with a long-lived `immutable` cache header (`/stockfish/*`).
- Engine reviews run with `requestIdleCallback` so they don't block UI.

---

## 21. Project structure

### 21.1 Folder layout

```
pawntrail/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   ├── verify/page.tsx
│   │   └── setup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── scan/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts
│   │   │   └── [scanId]/review/page.tsx
│   │   ├── games/
│   │   │   ├── page.tsx
│   │   │   └── [gameId]/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   ├── openings/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── billing/page.tsx
│   ├── api/
│   │   ├── billing/checkout/route.ts
│   │   └── billing/webhook/route.ts
│   ├── middleware.ts
│   └── layout.tsx
├── components/
│   ├── brand/
│   │   ├── TrailMark.tsx
│   │   └── TrailLockup.tsx
│   ├── board/
│   │   ├── ChessBoard.tsx
│   │   ├── EvalBar.tsx
│   │   ├── EvalGraph.tsx
│   │   └── BoardArrow.tsx
│   ├── engine/
│   │   ├── EnginePanel.tsx
│   │   └── EngineLine.tsx
│   ├── move-list/
│   │   ├── MoveList.tsx
│   │   └── MoveRow.tsx
│   ├── game/
│   │   ├── GameActions.tsx
│   │   └── GameMetadataCard.tsx
│   ├── library/
│   │   ├── LibraryTable.tsx
│   │   ├── LibraryFilters.tsx
│   │   └── EvalSparkline.tsx
│   ├── scan/
│   │   ├── UploadDropzone.tsx
│   │   └── ReviewEditor.tsx
│   ├── ui/                       # shadcn-style primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── chip.tsx
│   │   ├── modal.tsx
│   │   └── toast.tsx
│   └── shell/
│       ├── TopBar.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   ├── types.ts              # generated
│   │   └── queries.ts
│   ├── stockfish/
│   │   ├── worker.ts
│   │   └── parser.ts
│   ├── scanner/                  # ported from existing
│   ├── pgn/
│   │   ├── client.ts             # PGN microservice client
│   │   └── classify.ts           # move classification rules
│   ├── lichess/
│   │   └── verifyUser.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── sync.ts
│   ├── images/compress.ts
│   └── analytics.ts
├── hooks/
│   ├── useEngine.ts
│   ├── useBoardState.ts
│   └── useTheme.ts
├── styles/
│   ├── globals.css
│   └── board.css                 # chessground overrides
├── public/
│   ├── brand/...
│   ├── stockfish/
│   │   ├── stockfish.wasm.js
│   │   └── stockfish.wasm
│   └── chess/                    # piece SVGs if not using chessground defaults
├── scripts/
│   └── generate_trail_brand.py   # dev-only asset pipeline
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   └── seed.sql
├── tests/
│   ├── unit/
│   └── e2e/
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 21.2 Tailwind configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest:      'var(--pt-forest)',
        'forest-soft': 'var(--pt-forest-soft)',
        cream:       'var(--pt-cream)',
        'cream-soft':'var(--pt-cream-soft)',
        amber:       'var(--pt-amber)',
        ink:         'var(--pt-ink)',
      },
      fontFamily: {
        sans: ['Work Sans', 'Lato', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 22. Environment variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, for webhook writes

# PGN microservice
PT_PGN_SERVICE_URL=
PT_PGN_SERVICE_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# App
NEXT_PUBLIC_APP_URL=https://pawntrail.app

# Analytics (optional in dev)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

Add `.env.example` to the repo with placeholder values. Never commit real secrets.

---

## 23. Testing

### 23.1 Unit (Vitest)

Target 70 % coverage on `lib/*`. Critical paths:

- `lib/pgn/classify.ts` — classification deltas
- `lib/stockfish/parser.ts` — UCI line parsing
- `lib/images/compress.ts` — compression produces < 1 MB
- `lib/lichess/verifyUser.ts` — mocked fetch
- Supabase query builders

### 23.2 Integration

Test Supabase RLS with a running local Postgres:

```bash
npm run test:rls
```

Scenarios: user A can't read user B's games; unauth'd client can't read any games.

### 23.3 End-to-end (Playwright)

Critical flows:

- Sign in with phone OTP (mock Supabase Auth)
- Upload a fixture scoresheet image → see review screen → save game
- Open game detail → confirm engine panel populates within 5 s
- Paywall blocks 16th scan
- Delete account wipes data

### 23.4 Visual regression

Screenshot the three hero screens (dashboard, game detail, library) in both themes. Run on PR.

---

## 24. Deployment

### 24.1 Environments

- **Local** — `pnpm dev` against Supabase local (CLI) + Stripe test mode
- **Preview** — every PR auto-deploys to Vercel preview with test keys
- **Production** — `main` branch deploys to `pawntrail.app`, uses live keys

### 24.2 CI (GitHub Actions)

```
- checkout
- setup node 20
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- build (to catch type errors not caught above)
```

On `main`, Vercel picks up and deploys. Supabase migrations applied via `supabase db push` in a separate workflow (manually triggered for safety in v1).

### 24.3 Domain setup

- `pawntrail.com` → marketing (Framer or same Next.js with `(marketing)` group)
- `pawntrail.app` → product
- Shared cookie domain: not needed in v1 (marketing doesn't auth)

### 24.4 Observability

- Vercel logs for server actions and API routes
- Supabase logs for DB and Auth
- Sentry for client errors (v1.1 or v1 if budget allows)

---

## 25. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scanner accuracy on messy handwriting | High | Per-move confidence flagged in review UX; tap-to-fix; analytics on which move types fail most |
| Stockfish WASM slow on low-end phones | Medium | Default depth 22 on mobile; "Analyse deeper" opt-in; graceful fallback message |
| Phone number churn | Medium | Optional recovery email; phone change via support for v1 |
| PGN microservice downtime | Medium | Retry once; surface error with "Report this scan"; store raw OCR JSON so scan is recoverable when service is back |
| Paywall feels abrupt at #16 | Medium | Contextual counter starting at #10; clear framing of value already delivered |
| Lichess rate-limits username checks | Low | Session-level cache; fall back to optimistic save with background revalidation |
| SMS costs at scale | Medium | Throttle OTP requests to 3/hour per phone; block repeat signups from same device |

---

## 26. Open decisions

Record here as they arise. Claude Code should ask before resolving:

1. Free-tier limit: stick at 15 scans or bump to 20? Decision: **15 for v1**, instrument conversion, revisit after 30 days.
2. Does the PGN microservice support engine-annotated PGNs? Check with service owner before wiring client-side annotation. Default assumption: **no**, classification is client-side.
3. ECO lookup: bundle Lichess's ECO dataset (~80 KB) at build time? Yes — cheaper than network fetches per game.
4. Do we index by opening move sequence (not just ECO)? Defer to v1.1.

---

## 27. v1.1 candidates (next 90 days)

- Tournament manager with chess-results.com integration
- Native OAuth to Lichess for direct study creation
- Opening repertoire view with most-played, win rates, weakest-opening drill
- Shareable public game links (opt-in, rate-limited)
- Native mobile app (React Native / Expo, reusing Supabase backend)
- Club / team accounts
- Engine variations (play a line forward from any board position without creating a new game)
- Game annotations (text, arrows, circles) saved with the game

---

## 28. Glossary

- **Ply** — a single half-move (one side moves)
- **PV (principal variation)** — engine's forecasted continuation
- **MultiPV** — engine shows top N candidate PVs simultaneously
- **ECO** — Encyclopaedia of Chess Openings classification code (e.g. E21)
- **SAN** — Standard Algebraic Notation for moves (e.g. Nf3)
- **FEN** — Forsyth-Edwards Notation, a string representation of a board position
- **Centipawn (cp)** — 1/100 of a pawn; engine evaluation unit
- **RLS** — Row-Level Security, Postgres feature used to restrict rows per user

---

## Appendix A — First migration (authoritative)

Concatenation of the SQL blocks in § 7. Save as `supabase/migrations/0001_init.sql`. Run with `supabase db push`.

## Appendix B — README starter

```markdown
# PawnTrail

Snap the scoresheet. Chart the trail.

## Local dev

    pnpm install
    cp .env.example .env.local    # fill in Supabase and Stripe keys
    pnpm supabase:start           # local Postgres
    pnpm db:migrate
    pnpm dev

Runs at http://localhost:3000

## Scripts

    pnpm dev           next dev
    pnpm build         next build
    pnpm test          vitest
    pnpm test:e2e      playwright
    pnpm db:migrate    supabase db push
    pnpm types         supabase gen types typescript --project-id $PROJECT > lib/supabase/types.ts

## Repo map

See PRD-v1-detailed.md § 21.
```

---

*End of PRD.*
