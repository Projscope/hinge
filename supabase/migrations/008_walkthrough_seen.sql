-- ============================================================
-- myhinge — walkthrough_seen flag on profiles
-- ============================================================

alter table public.profiles
  add column if not exists walkthrough_seen boolean not null default false;
