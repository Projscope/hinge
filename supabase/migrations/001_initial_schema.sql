-- ============================================================
-- Hin.ge — initial schema
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- One row per auth user. Created automatically by trigger below.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  plan                   text not null default 'free' check (plan in ('free', 'pro', 'team')),
  freeze_used_this_month boolean not null default false,
  created_at             timestamptz not null default now()
);

-- ------------------------------------------------------------
-- daily_goals
-- One row per user per day. Unique constraint enforced at DB level.
-- ------------------------------------------------------------
create table if not exists public.daily_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  date       date not null,
  main_goal  text not null,
  area_tag   text check (area_tag in ('work', 'home', 'family', 'health', 'personal')),
  task1_text text not null default '',
  task1_done boolean not null default false,
  task2_text text not null default '',
  task2_done boolean not null default false,
  end_time   text not null default '18:00',
  completed  boolean not null default false,
  created_at timestamptz not null default now(),

  constraint daily_goals_user_date_unique unique (user_id, date)
);

-- ------------------------------------------------------------
-- overflow_items
-- Extra tasks logged during the day, linked to a daily_goal.
-- ------------------------------------------------------------
create table if not exists public.overflow_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  daily_goal_id  uuid not null references public.daily_goals (id) on delete cascade,
  text           text not null,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- streaks
-- One row per user, upserted on each end_day call.
-- ------------------------------------------------------------
create table if not exists public.streaks (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  current          integer not null default 0,
  personal_best    integer not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Users can only read and write their own data.
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.daily_goals    enable row level security;
alter table public.overflow_items enable row level security;
alter table public.streaks        enable row level security;

-- profiles
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- daily_goals
create policy "daily_goals: own rows" on public.daily_goals
  for all using (auth.uid() = user_id);

-- overflow_items
create policy "overflow_items: own rows" on public.overflow_items
  for all using (auth.uid() = user_id);

-- streaks
create policy "streaks: own row" on public.streaks
  for all using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
