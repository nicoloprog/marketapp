-- BanditPrice subscription plans and monthly search usage.
-- Run this once in the Supabase SQL editor after scripts/001_create_schema.sql.

alter table public.profiles
  add column if not exists subscription_plan text not null default 'free',
  add column if not exists subscription_billing_cycle text not null default 'monthly',
  add column if not exists search_limit_override integer,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text;

create index if not exists idx_profiles_stripe_customer_id
  on public.profiles (stripe_customer_id);

create index if not exists idx_profiles_stripe_subscription_id
  on public.profiles (stripe_subscription_id);

update public.profiles
set subscription_plan = 'business'
where subscription_plan = 'enterprise';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_subscription_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_subscription_plan_check
      check (subscription_plan in ('free', 'beginner', 'standard', 'business', 'custom'))
      not valid;
  end if;
end $$;

alter table public.profiles validate constraint profiles_subscription_plan_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_subscription_billing_cycle_check'
  ) then
    alter table public.profiles
      add constraint profiles_subscription_billing_cycle_check
      check (subscription_billing_cycle in ('monthly', 'yearly'))
      not valid;
  end if;
end $$;

alter table public.profiles validate constraint profiles_subscription_billing_cycle_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_search_limit_override_check'
  ) then
    alter table public.profiles
      add constraint profiles_search_limit_override_check
      check (search_limit_override is null or search_limit_override between 0 and 100000)
      not valid;
  end if;
end $$;

alter table public.profiles validate constraint profiles_search_limit_override_check;

create table if not exists public.monthly_search_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month text not null,
  used_count integer not null default 0,
  last_search_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_month),
  constraint monthly_search_usage_month_check check (usage_month ~ '^\d{4}-\d{2}$'),
  constraint monthly_search_usage_count_check check (used_count >= 0)
);

create index if not exists idx_monthly_search_usage_month
  on public.monthly_search_usage (usage_month);

alter table public.monthly_search_usage enable row level security;

drop policy if exists "Users can view own monthly search usage" on public.monthly_search_usage;
create policy "Users can view own monthly search usage"
  on public.monthly_search_usage
  for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all monthly search usage" on public.monthly_search_usage;
create policy "Admins can view all monthly search usage"
  on public.monthly_search_usage
  for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'ADMIN'
    )
  );

update public.profiles
set subscription_plan = case
  when is_paid = true and subscription_plan = 'free' then 'standard'
  else subscription_plan
end;
