'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AppState, DailyGoal, OverflowItem, Streaks } from './types'

const STORAGE_KEY = 'hinge_state'
const TODAY_KEY = 'hinge_today'

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultStreaks(): Streaks {
  return { current: 0, personalBest: 0, lastActiveDate: null }
}

function defaultState(): AppState {
  return {
    plan: 'free',
    today: null,
    streaks: defaultStreaks(),
    history: [],
    overflow: [],
    freezeUsedThisMonth: false,
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState()
  } catch {
    return defaultState()
  }
}

function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded — silently fail
  }
}

// Midnight reset: if lastActiveDate is yesterday or earlier and today has no goal, reset
function applyMidnightReset(state: AppState): AppState {
  const today = todayDate()
  const hasGoalToday = state.today?.date === today

  if (!hasGoalToday && state.today && state.today.date !== today) {
    // Mark previous goal as missed (if not completed) and reset streak
    const missedGoal = { ...state.today }
    const newStreaks = { ...state.streaks }

    if (!missedGoal.completed) {
      newStreaks.current = 0
    }

    return {
      ...state,
      today: null,
      streaks: newStreaks,
      history: [missedGoal, ...state.history],
    }
  }

  return state
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const loaded = loadState()
    const reset = applyMidnightReset(loaded)
    setState(reset)
    if (reset !== loaded) saveState(reset)
    setHydrated(true)
  }, [])

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  // Actions

  const setTodayGoal = useCallback(
    (goal: Omit<DailyGoal, 'id' | 'completed' | 'createdAt'>) => {
      update((s) => ({
        ...s,
        today: {
          ...goal,
          id: `${goal.date}-${Date.now()}`,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      }))
    },
    [update]
  )

  const toggleTask = useCallback(
    (taskNum: 1 | 2) => {
      update((s) => {
        if (!s.today) return s
        const field = taskNum === 1 ? 'task1Done' : 'task2Done'
        return { ...s, today: { ...s.today, [field]: !s.today[field] } }
      })
    },
    [update]
  )

  const addOverflow = useCallback(
    (text: string) => {
      update((s) => {
        if (!s.today) return s
        const item: OverflowItem = {
          id: `ov-${Date.now()}`,
          dailyGoalId: s.today.id,
          text,
          createdAt: new Date().toISOString(),
        }
        return { ...s, overflow: [item, ...s.overflow] }
      })
    },
    [update]
  )

  const endDay = useCallback(
    (completed: boolean) => {
      update((s) => {
        if (!s.today) return s
        const finishedGoal: DailyGoal = { ...s.today, completed }
        const newStreaks = { ...s.streaks }

        if (completed) {
          newStreaks.current += 1
          newStreaks.personalBest = Math.max(newStreaks.personalBest, newStreaks.current)
          newStreaks.lastActiveDate = todayDate()
        } else {
          newStreaks.current = 0
        }

        return {
          ...s,
          today: finishedGoal,
          streaks: newStreaks,
          history: [finishedGoal, ...s.history],
        }
      })
    },
    [update]
  )

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
    setTodayGoal,
    toggleTask,
    addOverflow,
    endDay,
  }
}
