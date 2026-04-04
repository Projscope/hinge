-- ============================================================
-- goal_queue table
-- Pre-loaded goals by area, pulled into morning setup.
-- ============================================================

create table if not exists public.goal_queue (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  text       text not null,
  area_tag   text not null check (area_tag in ('work', 'home', 'family', 'health', 'personal')),
  created_at timestamptz not null default now()
);

alter table public.goal_queue enable row level security;

create policy "goal_queue: own rows" on public.goal_queue
  for all using (auth.uid() = user_id);
