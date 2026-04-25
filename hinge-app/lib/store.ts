'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase/client'
import type { AppState, DailyGoal, OverflowItem, Streaks, TemplateTasks, MITTasks, TimeBlockTasks, LifeAreaTasks } from './types'
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

// Map snake_case DB rows → camelCase TypeScript types
function mapGoal(row: Record<string, unknown>): DailyGoal {
  return {
    id: row.id as string,
    date: row.date as string,
    templateType: (row.template_type as DailyGoal['templateType']) ?? 'focus',
    dayIntention: (row.day_intention as string) ?? undefined,
    areaTag: row.area_tag as DailyGoal['areaTag'],
    mainGoal: (row.main_goal as string) ?? '',
    task1Text: (row.task1_text as string) ?? '',
    task1Done: (row.task1_done as boolean) ?? false,
    task2Text: (row.task2_text as string) ?? '',
    task2Done: (row.task2_done as boolean) ?? false,
    tasks: (row.tasks as TemplateTasks) ?? undefined,
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setHydrated(true)
        return
      }

      const today = todayDate()

      const [profileRes, publicProfileRes, goalRes, historyRes, streaksRes] = await Promise.all([
        supabase.from('profiles').select('plan, freeze_used_this_month, walkthrough_seen').eq('id', user.id).single(),
        supabase.from('public_profiles').select('username').eq('user_id', user.id).maybeSingle(),
        supabase.from('daily_goals').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('daily_goals').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      const todayGoal = goalRes.data ? mapGoal(goalRes.data) : null
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
        history: (historyRes.data ?? []).map(mapGoal),
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
    async (goal: Omit<DailyGoal, 'id' | 'completed' | 'createdAt'>): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      const isFocus = goal.templateType === 'focus'

      const { data, error } = await supabase
        .from('daily_goals')
        .upsert(
          {
            user_id: user.id,
            date: goal.date,
            template_type: goal.templateType,
            day_intention: goal.dayIntention ?? null,
            area_tag: goal.areaTag ?? null,
            end_time: goal.endTime,
            completed: false,
            // Focus-specific columns (NOT NULL — use '' for non-focus templates)
            main_goal: isFocus ? goal.mainGoal : '',
            task1_text: isFocus ? goal.task1Text : '',
            task1_done: false,
            task2_text: isFocus ? goal.task2Text : '',
            task2_done: false,
            // Non-focus template data
            tasks: isFocus ? null : goal.tasks ?? null,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single()

      if (error || !data) return false

      const newGoal = mapGoal(data)
      setState((prev) => ({
        ...prev,
        today: newGoal,
        history: [newGoal, ...prev.history.filter((g) => g.date !== newGoal.date)],
      }))
      return true
    },
    [supabase]
  )

  // Focus-only: toggle task1 or task2
  const toggleTask = useCallback(
    async (taskNum: 1 | 2) => {
      if (!state.today || state.today.templateType !== 'focus') return

      const field = taskNum === 1 ? 'task1Done' : 'task2Done'
      const dbField = taskNum === 1 ? 'task1_done' : 'task2_done'
      const newVal = !state.today[field]

      setState((prev) => {
        if (!prev.today) return prev
        return { ...prev, today: { ...prev.today, [field]: newVal } }
      })

      supabase
        .from('daily_goals')
        .update({ [dbField]: newVal })
        .eq('id', state.today.id)
        .then(() => {/* intentional no-op */})
    },
    [supabase, state.today]
  )

  // All templates: toggle a task/block/area by index
  const toggleTemplateItem = useCallback(
    async (index: number) => {
      if (!state.today) return
      const goal = state.today

      if (goal.templateType === 'focus') {
        // Route to toggleTask for focus
        await toggleTask((index + 1) as 1 | 2)
        return
      }

      // Build updated tasks jsonb
      let updatedTasks: TemplateTasks

      if (goal.templateType === 'mit') {
        const mit = (goal.tasks as MITTasks) ?? { tasks: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }] }
        const tasks = mit.tasks.map((t, i) => i === index ? { ...t, done: !t.done } : t) as MITTasks['tasks']
        updatedTasks = { tasks }
      } else if (goal.templateType === 'timeblocks') {
        const tb = (goal.tasks as TimeBlockTasks) ?? { blocks: [{ label: 'Morning', intention: '', done: false }, { label: 'Afternoon', intention: '', done: false }, { label: 'Evening', intention: '', done: false }] as TimeBlockTasks['blocks'] }
        const blocks = tb.blocks.map((b, i) => i === index ? { ...b, done: !b.done } : b) as TimeBlockTasks['blocks']
        updatedTasks = { blocks }
      } else {
        const la = (goal.tasks as LifeAreaTasks) ?? { areas: (['work', 'home', 'family', 'health', 'personal'] as const).map((tag) => ({ tag, intention: '', done: false })) }
        const areas = la.areas.map((a, i) => i === index ? { ...a, done: !a.done } : a)
        updatedTasks = { areas }
      }

      // Optimistic update
      setState((prev) => {
        if (!prev.today) return prev
        return { ...prev, today: { ...prev.today, tasks: updatedTasks } }
      })

      supabase
        .from('daily_goals')
        .update({ tasks: updatedTasks })
        .eq('id', goal.id)
        .then(() => {/* intentional no-op */})
    },
    [supabase, state.today, toggleTask]
  )

  const addOverflow = useCallback(
    async (text: string) => {
      if (!state.today) return

      const {
        data: { user },
      } = await supabase.auth.getUser()
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
        .select()
        .single()

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
      })

      if (!completed) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('streaks')
            .update({ current: 0 })
            .eq('user_id', user.id)
        }
      }

      if (state.username) {
        fetch('/api/og/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: state.username }),
        }).catch(() => { /* non-critical */ })
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

  const todayOverflow = state.overflow.filter(
    (o) => o.dailyGoalId === state.today?.id
  )

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
    toggleTask,
    toggleTemplateItem,
    addOverflow,
    endDay,
    markWalkthroughSeen,
  }
}
