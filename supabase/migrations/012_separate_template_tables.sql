-- ============================================================
-- Replace daily_goals + tasks jsonb with 4 dedicated tables,
-- one per template. Migrate existing rows to focus_goals.
-- ============================================================

-- ── focus_goals ───────────────────────────────────────────────────────────────
create table if not exists public.focus_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  date          date not null,
  day_intention text,
  area_tag      text check (area_tag in ('work','home','family','health','personal')),
  main_goal     text not null default '',
  task1_text    text not null default '',
  task1_done    boolean not null default false,
  task2_text    text not null default '',
  task2_done    boolean not null default false,
  end_time      text not null default '23:59',
  completed     boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint focus_goals_user_date_unique unique (user_id, date)
);

-- ── mit_goals ─────────────────────────────────────────────────────────────────
create table if not exists public.mit_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  date          date not null,
  day_intention text,
  task1_text    text not null default '',
  task1_done    boolean not null default false,
  task2_text    text not null default '',
  task2_done    boolean not null default false,
  task3_text    text not null default '',
  task3_done    boolean not null default false,
  end_time      text not null default '23:59',
  completed     boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint mit_goals_user_date_unique unique (user_id, date)
);

-- ── timeblock_goals ───────────────────────────────────────────────────────────
create table if not exists public.timeblock_goals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  date               date not null,
  day_intention      text,
  block1_label       text not null default 'Morning',
  block1_intention   text not null default '',
  block1_done        boolean not null default false,
  block2_label       text not null default 'Afternoon',
  block2_intention   text not null default '',
  block2_done        boolean not null default false,
  block3_label       text not null default 'Evening',
  block3_intention   text not null default '',
  block3_done        boolean not null default false,
  end_time           text not null default '23:59',
  completed          boolean not null default false,
  created_at         timestamptz not null default now(),
  constraint timeblock_goals_user_date_unique unique (user_id, date)
);

-- ── life_area_goals ───────────────────────────────────────────────────────────
create table if not exists public.life_area_goals (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  date                date not null,
  day_intention       text,
  work_intention      text not null default '',
  work_done           boolean not null default false,
  home_intention      text not null default '',
  home_done           boolean not null default false,
  family_intention    text not null default '',
  family_done         boolean not null default false,
  health_intention    text not null default '',
  health_done         boolean not null default false,
  personal_intention  text not null default '',
  personal_done       boolean not null default false,
  end_time            text not null default '23:59',
  completed           boolean not null default false,
  created_at          timestamptz not null default now(),
  constraint life_area_goals_user_date_unique unique (user_id, date)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.focus_goals      enable row level security;
alter table public.mit_goals        enable row level security;
alter table public.timeblock_goals  enable row level security;
alter table public.life_area_goals  enable row level security;

-- focus_goals
create policy "focus_goals: user owns rows"
  on public.focus_goals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- mit_goals
create policy "mit_goals: user owns rows"
  on public.mit_goals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- timeblock_goals
create policy "timeblock_goals: user owns rows"
  on public.timeblock_goals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- life_area_goals
create policy "life_area_goals: user owns rows"
  on public.life_area_goals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Migrate existing daily_goals rows → focus_goals ───────────────────────────
insert into public.focus_goals (
  id, user_id, date, day_intention, area_tag,
  main_goal, task1_text, task1_done, task2_text, task2_done,
  end_time, completed, created_at
)
select
  id,
  user_id,
  date,
  null as day_intention,
  area_tag,
  coalesce(main_goal, ''),
  coalesce(task1_text, ''),
  coalesce(task1_done, false),
  coalesce(task2_text, ''),
  coalesce(task2_done, false),
  coalesce(end_time, '23:59'),
  coalesce(completed, false),
  created_at
from public.daily_goals
on conflict do nothing;

-- ── Drop old FK on overflow_items so we can reference any template table ──────
-- overflow_items.daily_goal_id becomes a free UUID reference (no FK constraint)
alter table public.overflow_items
  drop constraint if exists overflow_items_daily_goal_id_fkey;

-- ── Drop daily_goals (data is now in focus_goals) ────────────────────────────
drop table if exists public.daily_goals cascade;

-- ── Updated end_day RPC ───────────────────────────────────────────────────────
create or replace function public.end_day(
  p_goal_id       uuid,
  p_completed     boolean,
  p_template_type text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id        uuid;
  v_current        integer;
  v_personal_best  integer;
  v_last_active    date;
  v_new_current    integer;
  v_new_best       integer;
  v_new_date       date;
begin
  -- Resolve owner from the appropriate table
  case p_template_type
    when 'focus'      then select user_id into v_user_id from public.focus_goals      where id = p_goal_id;
    when 'mit'        then select user_id into v_user_id from public.mit_goals         where id = p_goal_id;
    when 'timeblocks' then select user_id into v_user_id from public.timeblock_goals   where id = p_goal_id;
    when 'lifeareas'  then select user_id into v_user_id from public.life_area_goals   where id = p_goal_id;
    else raise exception 'Unknown template type: %', p_template_type;
  end case;

  if v_user_id is null then
    raise exception 'Goal not found';
  end if;

  if v_user_id != auth.uid() then
    raise exception 'Unauthorized';
  end if;

  -- Mark the goal completed/missed in the appropriate table
  case p_template_type
    when 'focus'      then update public.focus_goals      set completed = p_completed where id = p_goal_id;
    when 'mit'        then update public.mit_goals         set completed = p_completed where id = p_goal_id;
    when 'timeblocks' then update public.timeblock_goals   set completed = p_completed where id = p_goal_id;
    when 'lifeareas'  then update public.life_area_goals   set completed = p_completed where id = p_goal_id;
  end case;

  -- Load current streak values
  select current, personal_best, last_active_date
  into v_current, v_personal_best, v_last_active
  from public.streaks
  where user_id = v_user_id;

  v_current       := coalesce(v_current, 0);
  v_personal_best := coalesce(v_personal_best, 0);

  if p_completed then
    -- Only continue streak if last active was yesterday; otherwise restart at 1
    if v_last_active = current_date - 1 or v_last_active is null then
      v_new_current := v_current + 1;
    else
      v_new_current := 1;
    end if;
    v_new_best := greatest(v_personal_best, v_new_current);
    v_new_date := current_date;
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
