export type Plan = 'free' | 'pro' | 'team'

export interface DailyGoal {
  id: string
  date: string // 'YYYY-MM-DD'
  mainGoal: string
  areaTag?: AreaTag
  task1Text: string
  task1Done: boolean
  task2Text: string
  task2Done: boolean
  endTime: string // 'HH:MM' 24h
  completed: boolean
  createdAt: string // ISO
}

export interface OverflowItem {
  id: string
  dailyGoalId: string
  text: string
  createdAt: string
}

export interface Streaks {
  current: number
  personalBest: number
  lastActiveDate: string | null // 'YYYY-MM-DD'
}

export type AreaTag = 'work' | 'home' | 'family' | 'health' | 'personal'

export interface AppState {
  plan: Plan
  today: DailyGoal | null
  streaks: Streaks
  history: DailyGoal[]
  overflow: OverflowItem[]
  freezeUsedThisMonth: boolean
  walkthroughSeen: boolean
  username: string | null
}

// Goal quality scoring result
export interface QualityScore {
  score: number      // 0–100
  label: string
  status: 'ok' | 'warn' | 'neutral'
  feedback: string
}

// Focus rank
export type FocusRank =
  | { label: 'Drifting'; icon: '🌫️'; range: 'Under 50%' }
  | { label: 'Intentional'; icon: '🎯'; range: '50–70%' }
  | { label: 'Focused'; icon: '⚡'; range: '70–89%' }
  | { label: 'Sharp'; icon: '🔪'; range: '90–97%' }
  | { label: 'Summit'; icon: '🏔️'; range: '98%+' }

export const FOCUS_RANKS = [
  { label: 'Drifting', icon: '🌫️', range: 'Under 50% hit rate', min: 0, max: 49 },
  { label: 'Intentional', icon: '🎯', range: '50–70% hit rate', min: 50, max: 69 },
  { label: 'Focused', icon: '⚡', range: '70–89% · consistent execution', min: 70, max: 89 },
  { label: 'Sharp', icon: '🔪', range: '90–97% hit rate', min: 90, max: 97 },
  { label: 'Summit', icon: '🏔️', range: '98%+ with 30+ day streak', min: 98, max: 100 },
] as const

export const AREA_TAGS: Record<AreaTag, { label: string; icon: string }> = {
  work: { label: 'Work', icon: '💼' },
  home: { label: 'Home', icon: '🏠' },
  family: { label: 'Family', icon: '👨‍👩‍👧' },
  health: { label: 'Health', icon: '💪' },
  personal: { label: 'Personal', icon: '🧠' },
}
