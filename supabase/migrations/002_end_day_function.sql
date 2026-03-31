-- ============================================================
-- end_day RPC
-- Called as: supabase.rpc('end_day', { p_goal_id, p_completed })
--
-- Atomically:
--   1. Marks the daily_goal completed/missed
--   2. Upserts the user's streak row
-- ============================================================

create or replace function public.end_day(
  p_goal_id  uuid,
  p_completed boolean
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id        uuid;
  v_current        integer;
  v_personal_best  integer;
  v_new_current    integer;
  v_new_best       integer;
  v_new_date       date;
begin
  -- Resolve owner and verify the calling user owns this goal
  select user_id into v_user_id
  from public.daily_goals
  where id = p_goal_id;

  if v_user_id is null then
    raise exception 'Goal not found';
  end if;

  if v_user_id != auth.uid() then
    raise exception 'Unauthorized';
  end if;

  -- Mark the goal
  update public.daily_goals
  set completed = p_completed
  where id = p_goal_id;

  -- Load current streak values (default 0 if no row yet)
  select current, personal_best
  into v_current, v_personal_best
  from public.streaks
  where user_id = v_user_id;

  v_current       := coalesce(v_current, 0);
  v_personal_best := coalesce(v_personal_best, 0);

  if p_completed then
    v_new_current := v_current + 1;
    v_new_best    := greatest(v_personal_best, v_new_current);
    v_new_date    := current_date;
  else
    v_new_current := 0;
    v_new_best    := v_personal_best;
    v_new_date    := null;
  end if;

  insert into public.streaks (user_id, current, personal_best, last_active_date, updated_at)
  values (v_user_id, v_new_current, v_new_best, v_new_date, now())
  on conflict (user_id) do update
    set current          = excluded.current,
        personal_best    = excluded.personal_best,
        last_active_date = case
                             when p_completed then excluded.last_active_date
                             else public.streaks.last_active_date
                           end,
        updated_at       = now();
end;
$$;
