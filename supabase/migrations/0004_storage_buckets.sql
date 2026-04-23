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
