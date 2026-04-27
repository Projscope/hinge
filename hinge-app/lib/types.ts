export type Plan = 'free' | 'pro' | 'team'

// ── Template types ────────────────────────────────────────────────────────────

export type TemplateType = 'focus' | 'mit' | 'timeblocks' | 'lifeareas'

export interface TemplateOption {
  type: TemplateType
  label: string
  description: string
  slots: string
}

export const TEMPLATES: TemplateOption[] = [
  {
    type: 'focus',
    label: 'Focus Mode',
    description: 'One goal. Two tasks that make it happen.',
    slots: '1 goal · 2 support tasks',
  },
  {
    type: 'mit',
    label: 'MIT',
    description: 'Three most important tasks. Equal weight.',
    slots: '3 tasks',
  },
  {
    type: 'timeblocks',
    label: 'Time Blocks',
    description: 'One intention per block of your day.',
    slots: 'Morning · Afternoon · Evening',
  },
  {
    type: 'lifeareas',
    label: 'Life Areas',
    description: 'One intention per life area. Day is balanced when 3+ done.',
    slots: 'Work · Health · Family · Personal · Home',
  },
]

// ── Per-template goal shapes ───────────────────────────────────────────────────

interface BaseGoal {
  id: string
  date: string          // 'YYYY-MM-DD'
  dayIntention?: string
  endTime: string       // 'HH:MM' 24h
  completed: boolean
  createdAt: string     // ISO
}

export interface FocusGoal extends BaseGoal {
  templateType: 'focus'
  areaTag?: AreaTag
  mainGoal: string
  task1Text: string
  task1Done: boolean
  task2Text: string
  task2Done: boolean
}

export interface MITGoal extends BaseGoal {
  templateType: 'mit'
  task1Text: string
  task1Done: boolean
  task2Text: string
  task2Done: boolean
  task3Text: string
  task3Done: boolean
}

export interface TimeBlockGoal extends BaseGoal {
  templateType: 'timeblocks'
  block1Label: string
  block1Intention: string
  block1Done: boolean
  block2Label: string
  block2Intention: string
  block2Done: boolean
  block3Label: string
  block3Intention: string
  block3Done: boolean
}

export interface LifeAreaGoal extends BaseGoal {
  templateType: 'lifeareas'
  workIntention: string
  workDone: boolean
  homeIntention: string
  homeDone: boolean
  familyIntention: string
  familyDone: boolean
  healthIntention: string
  healthDone: boolean
  personalIntention: string
  personalDone: boolean
}

export type DailyGoal = FocusGoal | MITGoal | TimeBlockGoal | LifeAreaGoal

// Distributive omit — preserves discriminated union members (Omit on a union
// collapses to shared keys only, losing template-specific fields like areaTag).
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never
export type NewDailyGoal = DistributiveOmit<DailyGoal, 'id' | 'completed' | 'createdAt'>

// ── Core types ────────────────────────────────────────────────────────────────

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
  dayEnded: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Primary display text for a goal across all templates */
export function getGoalHeadline(goal: DailyGoal): string {
  if (goal.templateType === 'focus') {
    return goal.dayIntention?.trim() || goal.mainGoal?.trim() || ''
  }
  return goal.dayIntention?.trim() || ''
}

export function isGoalReadyToClose(goal: DailyGoal): boolean {
  switch (goal.templateType) {
    case 'focus':
      return goal.task1Done && goal.task2Done
    case 'mit': {
      const filledMit = [
        { text: goal.task1Text, done: goal.task1Done },
        { text: goal.task2Text, done: goal.task2Done },
        { text: goal.task3Text, done: goal.task3Done },
      ].filter((t) => t.text.trim().length > 0)
      return filledMit.length > 0 && filledMit.every((t) => t.done)
    }
    case 'timeblocks': {
      const filledTb = [
        { intention: goal.block1Intention, done: goal.block1Done },
        { intention: goal.block2Intention, done: goal.block2Done },
        { intention: goal.block3Intention, done: goal.block3Done },
      ].filter((b) => b.intention.trim().length > 0)
      return filledTb.length > 0 && filledTb.every((b) => b.done)
    }
    case 'lifeareas': {
      const done = [goal.workDone, goal.homeDone, goal.familyDone, goal.healthDone, goal.personalDone].filter(Boolean).length
      return done >= 3
    }
  }
}

export function templateProgress(goal: DailyGoal): number {
  switch (goal.templateType) {
    case 'focus': {
      const done = (goal.task1Done ? 1 : 0) + (goal.task2Done ? 1 : 0)
      return Math.round((done / 2) * 100)
    }
    case 'mit': {
      const mitTasks = [
        { text: goal.task1Text, done: goal.task1Done },
        { text: goal.task2Text, done: goal.task2Done },
        { text: goal.task3Text, done: goal.task3Done },
      ].filter((t) => t.text.trim().length > 0)
      if (mitTasks.length === 0) return 0
      return Math.round((mitTasks.filter((t) => t.done).length / mitTasks.length) * 100)
    }
    case 'timeblocks': {
      const tbBlocks = [
        { intention: goal.block1Intention, done: goal.block1Done },
        { intention: goal.block2Intention, done: goal.block2Done },
        { intention: goal.block3Intention, done: goal.block3Done },
      ].filter((b) => b.intention.trim().length > 0)
      if (tbBlocks.length === 0) return 0
      return Math.round((tbBlocks.filter((b) => b.done).length / tbBlocks.length) * 100)
    }
    case 'lifeareas': {
      const done = [goal.workDone, goal.homeDone, goal.familyDone, goal.healthDone, goal.personalDone].filter(Boolean).length
      return Math.round((done / 5) * 100)
    }
  }
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
  work:     { label: 'Work',     icon: '💼' },
  home:     { label: 'Home',     icon: '🏠' },
  family:   { label: 'Family',   icon: '👨‍👩‍👧' },
  health:   { label: 'Health',   icon: '💪' },
  personal: { label: 'Personal', icon: '🧠' },
}
