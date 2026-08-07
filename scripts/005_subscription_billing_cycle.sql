-- Store Stripe billing cycle for subscription limits.
-- Yearly subscriptions receive 36,000 searches per year, enforced as
-- 3,000 searches per month.

alter table public.profiles
  add column if not exists subscription_billing_cycle text not null default 'monthly';

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
