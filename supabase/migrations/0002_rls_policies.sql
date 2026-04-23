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
