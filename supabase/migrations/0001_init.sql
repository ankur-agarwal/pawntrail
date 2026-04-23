-- 0001_init.sql — initial schema (PRD §7.1)
-- Reordered from PRD to fix forward-FK: profiles -> scans -> games -> moves -> billing_events.

-- gen_random_uuid() is built-in (pgcrypto preinstalled on Supabase);
-- citext needed for case-insensitive email.
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
-- image_paths is a text[] to support multi-sheet uploads (v1 ships single-sheet UI;
-- array is future-proof per wireframes review item 1).
create table public.scans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  image_paths  text[] not null,
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
  id                 uuid primary key default gen_random_uuid(),
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
  scan_image_path    text,
  scan_confidence    numeric(4, 3),
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
  id             uuid primary key default gen_random_uuid(),
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
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  stripe_event_id text unique not null,
  event_type      text not null,
  payload         jsonb not null,
  received_at     timestamptz not null default now()
);

create index billing_events_user_idx on public.billing_events (user_id);
