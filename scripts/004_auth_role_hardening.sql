-- Harden auth role handling.
-- Normal users must never be able to grant themselves admin access through
-- user_metadata or direct profile updates.

revoke update on public.profiles from anon, authenticated;
grant update (name) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'CUSTOMER',
    new.email
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email;

  return new;
end;
$$;
