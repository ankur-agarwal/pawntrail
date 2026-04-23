-- 0007_save_scan_as_game.sql — atomic game creation from a parsed scan.

create or replace function public.save_scan_as_game(
  p_scan_id    uuid,
  p_game_input jsonb,
  p_moves      jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_game_id uuid;
  v_scan    public.scans%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'not authenticated'; end if;

  select * into v_scan
  from public.scans
  where id = p_scan_id and user_id = v_user_id
  for update;
  if not found then raise exception 'scan not found or not owned by user'; end if;
  if v_scan.status = 'saved' then raise exception 'scan already saved'; end if;

  v_game_id := gen_random_uuid();

  insert into public.games (
    id, user_id,
    played_on, opponent_name, opponent_rating, color, result,
    time_control, tournament_name, round,
    pgn, scan_id, scan_image_path, scan_confidence,
    eco_code, opening_name
  ) values (
    v_game_id, v_user_id,
    nullif(p_game_input->>'played_on', '')::date,
    nullif(p_game_input->>'opponent_name', ''),
    nullif(p_game_input->>'opponent_rating', '')::int,
    p_game_input->>'color',
    p_game_input->>'result',
    nullif(p_game_input->>'time_control', ''),
    nullif(p_game_input->>'tournament_name', ''),
    nullif(p_game_input->>'round', ''),
    p_game_input->>'pgn',
    p_scan_id,
    case when array_length(v_scan.image_paths, 1) > 0 then v_scan.image_paths[1] else null end,
    nullif(p_game_input->>'scan_confidence', '')::numeric(4,3),
    nullif(p_game_input->>'eco_code', ''),
    nullif(p_game_input->>'opening_name', '')
  );

  insert into public.moves (game_id, ply, san, fen_after)
  select
    v_game_id,
    (m->>'ply')::int,
    m->>'san',
    m->>'fen_after'
  from jsonb_array_elements(p_moves) as m;

  update public.scans
  set status = 'saved', updated_at = now()
  where id = p_scan_id;

  return v_game_id;
end;
$$;

grant execute on function public.save_scan_as_game(uuid, jsonb, jsonb) to authenticated;
