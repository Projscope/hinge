-- Unified read-only view across all 4 template tables.
-- Replaces the dropped daily_goals table for public-facing queries
-- (public profile, leaderboard, share card, OG image).
create or replace view public.daily_goals_view
  with (security_invoker = true)
as
  select
    id, user_id, date, completed, created_at,
    day_intention, main_goal, area_tag
  from public.focus_goals
  union all
  select
    id, user_id, date, completed, created_at,
    day_intention,
    null::text as main_goal,
    null::text as area_tag
  from public.mit_goals
  union all
  select
    id, user_id, date, completed, created_at,
    day_intention,
    null::text as main_goal,
    null::text as area_tag
  from public.timeblock_goals
  union all
  select
    id, user_id, date, completed, created_at,
    day_intention,
    null::text as main_goal,
    null::text as area_tag
  from public.life_area_goals;
