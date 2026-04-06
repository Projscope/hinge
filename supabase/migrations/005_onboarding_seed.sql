-- ============================================================
-- myHinge — onboarding seed flags
-- ============================================================

-- Track whether a user has been seeded with example queue items
alter table public.profiles
  add column if not exists onboarding_seeded boolean not null default false;

-- Mark queue items as examples so the UI can badge + banner them
alter table public.goal_queue
  add column if not exists is_example boolean not null default false;
