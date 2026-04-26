'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase/client'
import type { AppState, DailyGoal, FocusGoal, MITGoal, TimeBlockGoal, LifeAreaGoal, OverflowItem, Streaks } from './types'
import { localDateStr } from './dateUtils'

// ── helpers ──────────────────────────────────────────────────────────────────

function todayDate(): string {
  return localDateStr()
}

function defaultStreaks(): Streaks {
  return { current: 0, personalBest: 0, lastActiveDate: null }
}

const CLOSED_KEY = (id: string) => `day_closed:${id}`

function defaultState(): AppState {
  return {
    plan: 'free',
    today: null,
    streaks: defaultStreaks(),
    history: [],
    overflow: [],
    freezeUsedThisMonth: false,
    walkthroughSeen: false,
    username: null,
    dayEnded: false,
  }
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function mapFocusGoal(row: Record<string, unknown>): FocusGoal {
  return {
    id: row.id as string,
    date: row.date as string,
    templateType: 'focus',
    dayIntention: (row.day_intention as string) ?? undefined,
    areaTag: (row.area_tag as FocusGoal['areaTag']) ?? undefined,
    mainGoal: (row.main_goal as string) ?? '',
    task1Text: (row.task1_text as string) ?? '',
    task1Done: (row.task1_done as boolean) ?? false,
    task2Text: (row.task2_text as string) ?? '',
    task2Done: (row.task2_done as boolean) ?? false,
    endTime: row.end_time as string,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

function mapMITGoal(row: Record<string, unknown>): MITGoal {
  return {
    id: row.id as string,
    date: row.date as string,
    templateType: 'mit',
    dayIntention: (row.day_intention as string) ?? undefined,
    task1Text: (row.task1_text as string) ?? '',
    task1Done: (row.task1_done as boolean) ?? false,
    task2Text: (row.task2_text as string) ?? '',
    task2Done: (row.task2_done as boolean) ?? false,
    task3Text: (row.task3_text as string) ?? '',
    task3Done: (row.task3_done as boolean) ?? false,
    endTime: row.end_time as string,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

function mapTimeBlockGoal(row: Record<string, unknown>): TimeBlockGoal {
  return {
    id: row.id as string,
    date: row.date as string,
    templateType: 'timeblocks',
    dayIntention: (row.day_intention as string) ?? undefined,
    block1Label: (row.block1_label as string) ?? 'Morning',
    block1Intention: (row.block1_intention as string) ?? '',
    block1Done: (row.block1_done as boolean) ?? false,
    block2Label: (row.block2_label as string) ?? 'Afternoon',
    block2Intention: (row.block2_intention as string) ?? '',
    block2Done: (row.block2_done as boolean) ?? false,
    block3Label: (row.block3_label as string) ?? 'Evening',
    block3Intention: (row.block3_intention as string) ?? '',
    block3Done: (row.block3_done as boolean) ?? false,
    endTime: row.end_time as string,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

function mapLifeAreaGoal(row: Record<string, unknown>): LifeAreaGoal {
  return {
    id: row.id as string,
    date: row.date as string,
    templateType: 'lifeareas',
    dayIntention: (row.day_intention as string) ?? undefined,
    workIntention: (row.work_intention as string) ?? '',
    workDone: (row.work_done as boolean) ?? false,
    homeIntention: (row.home_intention as string) ?? '',
    homeDone: (row.home_done as boolean) ?? false,
    familyIntention: (row.family_intention as string) ?? '',
    familyDone: (row.family_done as boolean) ?? false,
    healthIntention: (row.health_intention as string) ?? '',
    healthDone: (row.health_done as boolean) ?? false,
    personalIntention: (row.personal_intention as string) ?? '',
    personalDone: (row.personal_done as boolean) ?? false,
    endTime: row.end_time as string,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

function mapOverflow(row: Record<string, unknown>): OverflowItem {
  return {
    id: row.id as string,
    dailyGoalId: row.daily_goal_id as string,
    text: row.text as string,
    createdAt: row.created_at as string,
  }
}

function mapStreaks(row: Record<string, unknown> | null | undefined): Streaks {
  if (!row) return defaultStreaks()
  return {
    current: (row.current as number) ?? 0,
    personalBest: (row.personal_best as number) ?? 0,
    lastActiveDate: (row.last_active_date as string) ?? null,
  }
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState)
  const [hydrated, setHydrated] = useState(false)
  const supabase = createClient()

  // ── initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setHydrated(true)
        return
      }

      const today = todayDate()

      const [profileRes, publicProfileRes, streaksRes, focusRes, mitRes, tbRes, laRes] = await Promise.all([
        supabase.from('profiles').select('plan, freeze_used_this_month, walkthrough_seen').eq('id', user.id).single(),
        supabase.from('public_profiles').select('username').eq('user_id', user.id).maybeSingle(),
        supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('focus_goals').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('mit_goals').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('timeblock_goals').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('life_area_goals').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
      ])

      // Merge and sort all goals by date desc
      const allGoals: DailyGoal[] = [
        ...(focusRes.data ?? []).map(mapFocusGoal),
        ...(mitRes.data ?? []).map(mapMITGoal),
        ...(tbRes.data ?? []).map(mapTimeBlockGoal),
        ...(laRes.data ?? []).map(mapLifeAreaGoal),
      ].sort((a, b) => b.date.localeCompare(a.date))

      const todayGoal = allGoals.find((g) => g.date === today) ?? null
      const history = allGoals.filter((g) => g.date !== today)

      const dayEnded = todayGoal
        ? todayGoal.completed === true || localStorage.getItem(CLOSED_KEY(todayGoal.id)) === '1'
        : false

      let overflow: OverflowItem[] = []
      if (todayGoal) {
        const { data: overflowRows } = await supabase
          .from('overflow_items')
          .select('*')
          .eq('daily_goal_id', todayGoal.id)
          .order('created_at', { ascending: false })
        overflow = (overflowRows ?? []).map(mapOverflow)
      }

      const rawStreaks = mapStreaks(streaksRes.data)
      const streaks = (() => {
        if (!rawStreaks.lastActiveDate || rawStreaks.current === 0) return rawStreaks
        const last = new Date(rawStreaks.lastActiveDate + 'T00:00:00')
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        return last < yesterday ? { ...rawStreaks, current: 0 } : rawStreaks
      })()

      setState({
        plan: (profileRes.data?.plan as AppState['plan']) ?? 'free',
        today: todayGoal,
        streaks,
        history,
        overflow,
        freezeUsedThisMonth: profileRes.data?.freeze_used_this_month ?? false,
        walkthroughSeen: profileRes.data?.walkthrough_seen ?? false,
        username: (publicProfileRes.data?.username as string) ?? null,
        dayEnded,
      })
      setHydrated(true)
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── actions ─────────────────────────────────────────────────────────────────

  const setTodayGoal = useCallback(
    async (goal:
      | Omit<FocusGoal,     'id' | 'completed' | 'createdAt'>
      | Omit<MITGoal,       'id' | 'completed' | 'createdAt'>
      | Omit<TimeBlockGoal, 'id' | 'completed' | 'createdAt'>
      | Omit<LifeAreaGoal,  'id' | 'completed' | 'createdAt'>
    ): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      let data: Record<string, unknown> | null = null
      let error: unknown = null

      if (goal.templateType === 'focus') {
        const res = await supabase
          .from('focus_goals')
          .upsert({
            user_id: user.id,
            date: goal.date,
            day_intention: goal.dayIntention ?? null,
            area_tag: goal.areaTag ?? null,
            main_goal: goal.mainGoal,
            task1_text: goal.task1Text,
            task1_done: false,
            task2_text: goal.task2Text,
            task2_done: false,
            end_time: goal.endTime,
            completed: false,
          }, { onConflict: 'user_id,date' })
          .select().single()
        data = res.data as Record<string, unknown> | null
        error = res.error

      } else if (goal.templateType === 'mit') {
        const res = await supabase
          .from('mit_goals')
          .upsert({
            user_id: user.id,
            date: goal.date,
            day_intention: goal.dayIntention ?? null,
            task1_text: goal.task1Text,
            task1_done: false,
            task2_text: goal.task2Text,
            task2_done: false,
            task3_text: goal.task3Text,
            task3_done: false,
            end_time: goal.endTime,
            completed: false,
          }, { onConflict: 'user_id,date' })
          .select().single()
        data = res.data as Record<string, unknown> | null
        error = res.error

      } else if (goal.templateType === 'timeblocks') {
        const res = await supabase
          .from('timeblock_goals')
          .upsert({
            user_id: user.id,
            date: goal.date,
            day_intention: goal.dayIntention ?? null,
            block1_label: goal.block1Label,
            block1_intention: goal.block1Intention,
            block1_done: false,
            block2_label: goal.block2Label,
            block2_intention: goal.block2Intention,
            block2_done: false,
            block3_label: goal.block3Label,
            block3_intention: goal.block3Intention,
            block3_done: false,
            end_time: goal.endTime,
            completed: false,
          }, { onConflict: 'user_id,date' })
          .select().single()
        data = res.data as Record<string, unknown> | null
        error = res.error

      } else if (goal.templateType === 'lifeareas') {
        const res = await supabase
          .from('life_area_goals')
          .upsert({
            user_id: user.id,
            date: goal.date,
            day_intention: goal.dayIntention ?? null,
            work_intention: goal.workIntention,
            work_done: false,
            home_intention: goal.homeIntention,
            home_done: false,
            family_intention: goal.familyIntention,
            family_done: false,
            health_intention: goal.healthIntention,
            health_done: false,
            personal_intention: goal.personalIntention,
            personal_done: false,
            end_time: goal.endTime,
            completed: false,
          }, { onConflict: 'user_id,date' })
          .select().single()
        data = res.data as Record<string, unknown> | null
        error = res.error
      }

      if (error || !data) return false

      const newGoal = goal.templateType === 'focus'   ? mapFocusGoal(data)
                    : goal.templateType === 'mit'       ? mapMITGoal(data)
                    : goal.templateType === 'timeblocks' ? mapTimeBlockGoal(data)
                    : mapLifeAreaGoal(data)

      setState((prev) => ({
        ...prev,
        today: newGoal,
        history: [newGoal, ...prev.history.filter((g) => g.date !== newGoal.date)],
      }))
      return true
    },
    [supabase]
  )

  // Toggle a task/block/area by index (all templates)
  const toggleTemplateItem = useCallback(
    async (index: number) => {
      if (!state.today) return
      const goal = state.today

      if (goal.templateType === 'focus') {
        const field = index === 0 ? 'task1Done' : 'task2Done'
        const dbField = index === 0 ? 'task1_done' : 'task2_done'
        const newVal = !goal[field]
        setState((prev) => {
          if (!prev.today || prev.today.templateType !== 'focus') return prev
          return { ...prev, today: { ...prev.today, [field]: newVal } }
        })
        supabase.from('focus_goals').update({ [dbField]: newVal }).eq('id', goal.id).then(() => {})

      } else if (goal.templateType === 'mit') {
        const fields = ['task1Done', 'task2Done', 'task3Done'] as const
        const dbFields = ['task1_done', 'task2_done', 'task3_done']
        const field = fields[index]
        const newVal = !goal[field]
        setState((prev) => {
          if (!prev.today || prev.today.templateType !== 'mit') return prev
          return { ...prev, today: { ...prev.today, [field]: newVal } }
        })
        supabase.from('mit_goals').update({ [dbFields[index]]: newVal }).eq('id', goal.id).then(() => {})

      } else if (goal.templateType === 'timeblocks') {
        const fields = ['block1Done', 'block2Done', 'block3Done'] as const
        const dbFields = ['block1_done', 'block2_done', 'block3_done']
        const field = fields[index]
        const newVal = !goal[field]
        setState((prev) => {
          if (!prev.today || prev.today.templateType !== 'timeblocks') return prev
          return { ...prev, today: { ...prev.today, [field]: newVal } }
        })
        supabase.from('timeblock_goals').update({ [dbFields[index]]: newVal }).eq('id', goal.id).then(() => {})

      } else if (goal.templateType === 'lifeareas') {
        const fields = ['workDone', 'homeDone', 'familyDone', 'healthDone', 'personalDone'] as const
        const dbFields = ['work_done', 'home_done', 'family_done', 'health_done', 'personal_done']
        const field = fields[index]
        const newVal = !goal[field]
        setState((prev) => {
          if (!prev.today || prev.today.templateType !== 'lifeareas') return prev
          return { ...prev, today: { ...prev.today, [field]: newVal } }
        })
        supabase.from('life_area_goals').update({ [dbFields[index]]: newVal }).eq('id', goal.id).then(() => {})
      }
    },
    [supabase, state.today]
  )

  const addOverflow = useCallback(
    async (text: string) => {
      if (!state.today) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const optimisticId = `optimistic-${Date.now()}`
      const optimistic: OverflowItem = {
        id: optimisticId,
        dailyGoalId: state.today.id,
        text,
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({ ...prev, overflow: [optimistic, ...prev.overflow] }))

      const { data } = await supabase
        .from('overflow_items')
        .insert({ user_id: user.id, daily_goal_id: state.today!.id, text })
        .select().single()

      if (data) {
        setState((prev) => ({
          ...prev,
          overflow: prev.overflow.map((o) => (o.id === optimisticId ? mapOverflow(data) : o)),
        }))
      }
    },
    [supabase, state.today]
  )

  const endDay = useCallback(
    async (completed: boolean) => {
      if (!state.today) return

      localStorage.setItem(CLOSED_KEY(state.today.id), '1')

      setState((prev) => {
        if (!prev.today) return prev
        const finishedGoal = { ...prev.today, completed }
        const newStreaks = { ...prev.streaks }
        if (completed) {
          newStreaks.current += 1
          newStreaks.personalBest = Math.max(newStreaks.personalBest, newStreaks.current)
          newStreaks.lastActiveDate = todayDate()
        } else {
          newStreaks.current = 0
        }
        return {
          ...prev,
          today: finishedGoal,
          streaks: newStreaks,
          history: [finishedGoal, ...prev.history.filter((g) => g.date !== finishedGoal.date)],
          dayEnded: true,
        }
      })

      await supabase.rpc('end_day', {
        p_goal_id: state.today.id,
        p_completed: completed,
        p_template_type: state.today.templateType,
      })

      if (!completed) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('streaks').update({ current: 0 }).eq('user_id', user.id)
        }
      }

      if (state.username) {
        fetch('/api/og/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: state.username }),
        }).catch(() => {})
      }
    },
    [supabase, state.today, state.username]
  )

  const markWalkthroughSeen = useCallback(async () => {
    setState((prev) => ({ ...prev, walkthroughSeen: true }))
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ walkthrough_seen: true }).eq('id', user.id)
  }, [supabase])

  const todayOverflow = state.overflow.filter((o) => o.dailyGoalId === state.today?.id)

  return {
    state,
    hydrated,
    today: state.today,
    streaks: state.streaks,
    history: state.history,
    todayOverflow,
    plan: state.plan,
    walkthroughSeen: state.walkthroughSeen,
    username: state.username,
    dayEnded: state.dayEnded,
    setTodayGoal,
    toggleTemplateItem,
    addOverflow,
    endDay,
    markWalkthroughSeen,
  }
}
