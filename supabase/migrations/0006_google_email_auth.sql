-- 0006_google_email_auth.sql — switch from phone OTP to Google OAuth + email magic link.
-- Phone becomes optional (future: recovery method in Settings).
-- handle_new_user now captures display_name from OAuth provider metadata.

alter table public.profiles alter column phone drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, phone, email, display_name)
    values (
      new.id,
      new.phone,
      nullif(new.email, '')::citext,
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        nullif(split_part(coalesce(new.email, ''), '@', 1), '')
      )
    )
    on conflict (id) do nothing;
  return new;
end;
$$;
