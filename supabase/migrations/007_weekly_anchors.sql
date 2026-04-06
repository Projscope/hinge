-- ============================================================
-- myhinge — weekly anchors
-- One row per user per week (keyed on Monday date).
-- ============================================================

create table if not exists public.weekly_anchors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  week_start  date not null,          -- Monday YYYY-MM-DD
  text        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint weekly_anchors_user_week_unique unique (user_id, week_start)
);

alter table public.weekly_anchors enable row level security;

create policy "weekly_anchors: own rows" on public.weekly_anchors
  for all using (auth.uid() = user_id);
