-- 0005_profile_on_signup.sql — auto-create profiles row on new auth user (PRD §8.5 #1)

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
      coalesce(new.phone, ''),
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
