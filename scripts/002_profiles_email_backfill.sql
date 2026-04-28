alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists is_paid boolean not null default false;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

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
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'CUSTOMER'),
    new.email
  )
  on conflict (id) do update
  set
    name = excluded.name,
    role = excluded.role,
    email = excluded.email;

  return new;
end;
$$;
