'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase/client'
import type { AppState, DailyGoal, OverflowItem, Streaks } from './types'
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
    mainGoal: row.main_goal as string,
    areaTag: row.area_tag as DailyGoal['areaTag'],
    task1Text: row.task1_text as string,
    task1Done: row.task1_done as boolean,
    task2Text: row.task2_text as string,
    task2Done: row.task2_done as boolean,
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

      // Fire all reads in parallel
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

      // Load overflow items for today's goal (if it exists)
      let overflow: OverflowItem[] = []
      if (todayGoal) {
        const { data: overflowRows } = await supabase
          .from('overflow_items')
          .select('*')
          .eq('daily_goal_id', todayGoal.id)
          .order('created_at', { ascending: false })
        overflow = (overflowRows ?? []).map(mapOverflow)
      }

      // Midnight reset: if there's a goal from a previous day still in `today`
      // and it wasn't completed, it was a miss. Archive it and reset streak.
      // (The server-side check: today's query returns null for past dates, so
      // this just means today is clean. Streak reset is handled by end_day RPC.)

      setState({
        plan: (profileRes.data?.plan as AppState['plan']) ?? 'free',
        today: todayGoal,
        streaks: mapStreaks(streaksRes.data),
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
    async (goal: Omit<DailyGoal, 'id' | 'completed' | 'createdAt'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('daily_goals')
        .upsert(
          {
            user_id: user.id,
            date: goal.date,
            main_goal: goal.mainGoal,
            area_tag: goal.areaTag ?? null,
            task1_text: goal.task1Text,
            task1_done: false,
            task2_text: goal.task2Text,
            task2_done: false,
            end_time: goal.endTime,
            completed: false,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single()

      if (error || !data) return

      const newGoal = mapGoal(data)
      setState((prev) => ({
        ...prev,
        today: newGoal,
        history: [newGoal, ...prev.history.filter((g) => g.date !== newGoal.date)],
      }))
    },
    [supabase]
  )

  const toggleTask = useCallback(
    async (taskNum: 1 | 2) => {
      if (!state.today) return

      const field = taskNum === 1 ? 'task1Done' : 'task2Done'
      const dbField = taskNum === 1 ? 'task1_done' : 'task2_done'
      const newVal = !state.today[field]

      // Optimistic update
      setState((prev) => {
        if (!prev.today) return prev
        return { ...prev, today: { ...prev.today, [field]: newVal } }
      })

      // Persist in background — fire-and-forget, optimistic state already applied
      supabase
        .from('daily_goals')
        .update({ [dbField]: newVal })
        .eq('id', state.today.id)
        .then(() => {/* intentional no-op */})
    },
    [supabase, state.today]
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

      // Optimistic update
      setState((prev) => ({ ...prev, overflow: [optimistic, ...prev.overflow] }))

      // Persist and swap out the optimistic id
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

      // Mark as closed in localStorage so dayEnded survives a refresh
      localStorage.setItem(CLOSED_KEY(state.today.id), '1')

      // Optimistic update
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

      // Atomic DB update via RPC
      await supabase.rpc('end_day', {
        p_goal_id: state.today.id,
        p_completed: completed,
      })

      // If missed, explicitly reset streak in DB — the RPC may not do this,
      // causing the public share page to show a stale streak count.
      if (!completed) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('streaks')
            .update({ current: 0 })
            .eq('user_id', user.id)
        }
      }
    },
    [supabase, state.today]
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
    addOverflow,
    endDay,
    markWalkthroughSeen,
  }
}
