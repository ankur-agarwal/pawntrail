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
