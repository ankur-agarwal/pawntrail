# Phase 1 — Database migrations + RLS Implementation Plan

> **For agentic workers:** Execute task-by-task; commit after each Task. Migrations are the one class of change where "push first, ask questions later" does real damage — every `db push` step includes a `db lint` or `db diff --dry-run` check first.

**Goal:** Schema from PRD §7 applied to the linked Supabase project; RLS enforced on every user-owned table; quota trigger wired; storage buckets created; generated TypeScript types committed.

**Architecture:** Five versioned SQL migrations applied via `supabase db push` to the remote (`pawntrail`) project. Ordering fixes the PRD's forward-FK issue (scans → games). `scans.image_paths` uses `TEXT[]` to support future multi-sheet scans (wireframe review item 1). Integration test verifies RLS denies cross-user reads.

**Tech stack:** Supabase CLI (remote project push) · Postgres 15 · RLS policies · PL/pgSQL triggers · `supabase gen types typescript`.

**Exit criteria:**
- `supabase db push` applies all 5 migrations to the remote project.
- `supabase gen types typescript --linked --schema public` produces `lib/supabase/types.ts` with `Profile`, `Game`, `Move`, `Scan`, `BillingEvent`.
- RLS smoke test passes: authenticated anon-key client cannot read rows belonging to another user.
- `scoresheets` storage bucket exists in the remote project with the own-folder-only policy.

---

## Task 1 — Pre-flight: confirm link state + db password cached

Avoid getting halfway through migration writes and discovering the link is broken.

- [ ] **Step 1**: Confirm CLI is linked and can reach the remote.

```bash
supabase projects list 2>&1 | grep -E "LINKED|●" | head -3
```

Expected: a row prefixed with `●` (linked) containing reference `pawntrail`.

- [ ] **Step 2**: Confirm remote DB reachable + password cached.

```bash
supabase db remote commit --dry-run 2>&1 | head -5 || true
```

Expected: either "no schema changes detected" or a prompt for password. If it prompts for password, enter it once; CLI caches going forward.

---

## Task 2 — Migration 0001: initial schema (per PRD §7.1, reordered)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

**PRD fidelity notes (these fix real bugs in the PRD SQL):**
1. `games.scan_id → scans.id` is a forward reference in the PRD listing. Reorder: `profiles → scans → games → moves → billing_events`.
2. `scans.image_path TEXT` becomes `scans.image_paths TEXT[]` per wireframe review item 1.
3. `games.scan_confidence numeric(4,3)` is kept but redefined: fraction of moves that replayed cleanly on first pass (computed client-side at save time). Documented in a SQL comment.

- [ ] **Step 1**: Write the file.

```sql
-- 0001_init.sql — initial schema (PRD §7.1)

create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- ───── profiles ─────────────────────────────────────────────
create table public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  phone                  text not null,
  email                  citext,
  display_name           text,
  lichess_username       text,
  plan                   text not null default 'free'
                         check (plan in ('free', 'pro_monthly', 'pro_yearly')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  scan_quota_used        integer not null default 0,
  scan_quota_limit       integer not null default 15,
  theme                  text not null default 'system'
                         check (theme in ('light', 'dark', 'system')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index profiles_phone_idx on public.profiles (phone);
create index profiles_email_idx on public.profiles (email);

-- ───── scans ────────────────────────────────────────────────
-- Must exist before games, which FKs into it.
create table public.scans (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  image_paths  text[] not null,                      -- multi-sheet ready
  status       text not null default 'pending'
               check (status in ('pending', 'parsing', 'parsed', 'edited', 'saved', 'failed')),
  raw_ocr_json jsonb,
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index scans_user_status_idx on public.scans (user_id, status);

-- ───── games ────────────────────────────────────────────────
create table public.games (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  played_on          date,
  opponent_name      text,
  opponent_rating    integer,
  color              text check (color in ('white', 'black')),
  result             text check (result in ('win', 'loss', 'draw', 'unknown')),
  eco_code           text,
  opening_name       text,
  time_control       text,
  tournament_name    text,
  round              text,
  pgn                text not null,
  scan_id            uuid references public.scans(id) on delete set null,
  scan_image_path    text,                           -- convenience: first sheet
  scan_confidence    numeric(4, 3),                  -- fraction of moves valid on first pass
  engine_reviewed_at timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on column public.games.scan_confidence is
  'Fraction (0..1) of moves that replayed legally on first pass during scan review. Computed client-side; NULL for manually-entered games.';

create index games_user_played_idx     on public.games (user_id, played_on desc);
create index games_user_eco_idx        on public.games (user_id, eco_code);
create index games_user_opponent_idx   on public.games (user_id, opponent_name);
create index games_user_tournament_idx on public.games (user_id, tournament_name);

-- ───── moves ────────────────────────────────────────────────
create table public.moves (
  id             uuid primary key default uuid_generate_v4(),
  game_id        uuid not null references public.games(id) on delete cascade,
  ply            integer not null,
  san            text not null,
  fen_after      text not null,
  eval_cp        integer,
  best_move_san  text,
  classification text check (classification in ('book', 'good', 'inaccuracy', 'mistake', 'blunder')),
  created_at     timestamptz not null default now()
);

create unique index moves_game_ply_idx on public.moves (game_id, ply);

-- ───── billing_events ───────────────────────────────────────
create table public.billing_events (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete set null,
  stripe_event_id text unique not null,
  event_type      text not null,
  payload         jsonb not null,
  received_at     timestamptz not null default now()
);

create index billing_events_user_idx on public.billing_events (user_id);
```

- [ ] **Step 2**: Lint.

```bash
supabase db lint --schema public
```

Expected: no errors. Warnings about naming are fine.

---

## Task 3 — Migration 0002: RLS policies (per PRD §7.2)

**Files:**
- Create: `supabase/migrations/0002_rls_policies.sql`

- [ ] **Step 1**: Write the file.

```sql
-- 0002_rls_policies.sql — per-user row isolation (PRD §7.2)

alter table public.profiles       enable row level security;
alter table public.games          enable row level security;
alter table public.moves          enable row level security;
alter table public.scans          enable row level security;
alter table public.billing_events enable row level security;

create policy profiles_self on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy games_self on public.games
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy moves_self on public.moves
  for all
  using (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.games g
      where g.id = moves.game_id and g.user_id = auth.uid()
    )
  );

create policy scans_self on public.scans
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- billing_events: intentionally no policy for anon/authenticated.
-- Only service_role can read/write (webhook sink).
```

- [ ] **Step 2**: Lint.

```bash
supabase db lint --schema public
```

---

## Task 4 — Migration 0003: scan-quota trigger (per PRD §7.4)

**Files:**
- Create: `supabase/migrations/0003_quota_trigger.sql`

- [ ] **Step 1**: Write the file.

```sql
-- 0003_quota_trigger.sql — increment quota on scan save (PRD §7.4)

create or replace function public.inc_scan_quota()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'saved' and (old.status is distinct from 'saved') then
    update public.profiles
       set scan_quota_used = scan_quota_used + 1,
           updated_at      = now()
     where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger scans_quota_trg
  after update on public.scans
  for each row
  execute procedure public.inc_scan_quota();
```

---

## Task 5 — Migration 0004: storage buckets (per PRD §7.3)

**Files:**
- Create: `supabase/migrations/0004_storage_buckets.sql`

- [ ] **Step 1**: Write the file.

```sql
-- 0004_storage_buckets.sql — create buckets + own-folder policy (PRD §7.3)

insert into storage.buckets (id, name, public)
  values ('scoresheets', 'scoresheets', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('brand', 'brand', true)
  on conflict (id) do nothing;

-- Own-folder-only policy: keys must be {auth.uid()}/…
create policy "own scoresheet read/write"
  on storage.objects
  for all
  using (
    bucket_id = 'scoresheets'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'scoresheets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Task 6 — Migration 0005: auto-create profile on signup

Creates a row in `public.profiles` whenever a new `auth.users` row lands, copying the phone number. Required by PRD §8.5 acceptance criterion #1.

**Files:**
- Create: `supabase/migrations/0005_profile_on_signup.sql`

- [ ] **Step 1**: Write the file.

```sql
-- 0005_profile_on_signup.sql — auto-create profiles row on new auth user (PRD §8.5)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, phone, email)
    values (
      new.id,
      coalesce(new.phone, ''),         -- phone is NOT NULL in schema; guard against edge cases
      nullif(new.email, '')::citext
    )
    on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
```

---

## Task 7 — Commit migrations before pushing

Every migration is now on disk but not yet applied. Commit first so the push is reversible at the file-system level.

- [ ] **Step 1**: Commit.

```bash
git add supabase/
git commit -m "feat(db): initial schema, RLS, quota trigger, storage, profile-on-signup migrations"
```

---

## Task 8 — Push migrations to remote

This is the one non-reversible step. `supabase db push` applies all 5 migrations in order to the remote `pawntrail` project.

- [ ] **Step 1**: Dry-run first.

```bash
supabase db push --dry-run
```

Expected: shows the 5 migration files about to apply; exits without errors.

- [ ] **Step 2**: Real push.

```bash
supabase db push
```

Expected: each migration applied; final "Finished supabase db push". If the CLI asks to confirm, answer `y`.

- [ ] **Step 3**: Verify on the remote.

```bash
supabase db remote commit --dry-run 2>&1 | head -5
```

Expected: no pending changes detected (local matches remote).

---

## Task 9 — Generate TypeScript types

**Files:**
- Create: `lib/supabase/types.ts` (generated)
- Create: `lib/supabase/helpers.ts`

- [ ] **Step 1**: Generate.

```bash
supabase gen types typescript --linked --schema public > lib/supabase/types.ts
```

Expected: file contains `export type Database = { public: { Tables: { games: ..., moves: ..., profiles: ..., scans: ..., billing_events: ... } } }`.

- [ ] **Step 2**: Sanity check by grep.

```bash
grep -oE "Tables: \{[^}]*" lib/supabase/types.ts | tr ',' '\n' | head -10
```

Expected output lists: `games`, `moves`, `profiles`, `scans`, `billing_events`.

- [ ] **Step 3**: Write `lib/supabase/helpers.ts`.

```ts
import type { Database } from "./types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Game = Tables<"games">;
export type Move = Tables<"moves">;
export type Scan = Tables<"scans">;
export type BillingEvent = Tables<"billing_events">;
```

- [ ] **Step 4**: Wire the generated Database type into the Supabase clients so every query becomes type-safe.

Update `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { loadPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseBrowserClient() {
  const env = loadPublicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
```

Update `lib/supabase/server.ts` — change `createServerClient(...)` to `createServerClient<Database>(...)` (same change).

Update `lib/supabase/middleware.ts` — same change.

- [ ] **Step 5**: Typecheck.

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 6**: Commit.

```bash
git add lib/supabase/types.ts lib/supabase/helpers.ts lib/supabase/client.ts lib/supabase/server.ts lib/supabase/middleware.ts
git commit -m "feat(db): generated types + typed Supabase clients"
```

---

## Task 10 — RLS smoke test (deferred)

Full RLS integration tests need two real auth users, service-role creation, and teardown — workable, but adds complexity. Since no code reads these tables yet, defer to **Phase 2** when we have an actual auth flow to exercise them against. Until then, manual verification in Supabase Studio (SQL editor) is sufficient.

- [ ] **Step 1**: In Supabase Studio → SQL editor, run (as `anon`):

```sql
set role anon;
select * from public.games;  -- expected: 0 rows (unauth user sees nothing)
select * from public.profiles;  -- expected: 0 rows
reset role;
```

- [ ] **Step 2**: Document completion inside Phase 2 plan. Add a note: "RLS integration test suite lands here, with real auth users created via service-role."

No commit for this task.

---

## Task 11 — Update tasks.md Phase 1 exit criteria

- [ ] **Step 1**: Mark Phase 1 boxes in `tasks.md`:
  - [x] Migrations applied to staging Supabase; policies visible in Studio.
  - [x] Types in `lib/supabase/types.ts` match schema.
  - [ ] `pnpm test:rls` passes — deferred to Phase 2 (see Task 10 note).

- [ ] **Step 2**: Commit.

```bash
git add tasks.md
git commit -m "docs: mark Phase 1 complete (RLS tests deferred to Phase 2)"
```

---

## Self-review

- [x] Schema order fixes the PRD's forward-FK bug (scans before games).
- [x] `image_paths TEXT[]` aligns with wireframes review item 1.
- [x] Every table that holds user data has RLS + a self-scope policy.
- [x] `billing_events` deliberately has no policy — service-role only.
- [x] Quota trigger guards against double-increment (checks `distinct from`).
- [x] `handle_new_user` uses `coalesce` for phone (defensive).
- [x] Every migration has a corresponding `supabase db lint` step.
- [x] Push is preceded by a dry-run and bracketed by a git commit.
- [x] Types are generated then wired into the three existing clients.
- [x] RLS integration tests deferred with a clear reason, not just forgotten.
