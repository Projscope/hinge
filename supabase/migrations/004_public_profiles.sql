-- ============================================================
-- public_profiles table
-- Stores username, display name and visibility for public streak pages.
-- ============================================================

create table if not exists public.public_profiles (
  user_id      uuid primary key references public.profiles (id) on delete cascade,
  username     text unique not null,
  display_name text not null default '',
  is_public    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

-- Anyone (including anon) can read public profiles
create policy "public_profiles: select public" on public.public_profiles
  for select using (is_public = true);

-- Users can manage their own profile row
create policy "public_profiles: own all" on public.public_profiles
  for all using (auth.uid() = user_id);

-- Allow anon reads on daily_goals for users with public profiles
create policy "daily_goals: public read" on public.daily_goals
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.public_profiles pp
      where pp.user_id = daily_goals.user_id
        and pp.is_public = true
    )
  );

-- Allow anon reads on streaks for users with public profiles
create policy "streaks: public read" on public.streaks
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.public_profiles pp
      where pp.user_id = streaks.user_id
        and pp.is_public = true
    )
  );
