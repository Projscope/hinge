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

// ── Template task shapes (stored as jsonb in DB for non-focus templates) ──────

export interface MITTask {
  text: string
  done: boolean
}

export interface MITTasks {
  tasks: [MITTask, MITTask, MITTask]
}

export interface TimeBlock {
  label: string   // customizable, defaults to Morning/Afternoon/Evening
  intention: string
  done: boolean
}

export interface TimeBlockTasks {
  blocks: [TimeBlock, TimeBlock, TimeBlock]
}

export interface LifeAreaItem {
  tag: AreaTag
  intention: string
  done: boolean
}

export interface LifeAreaTasks {
  areas: LifeAreaItem[]  // always 5, one per area
}

export type TemplateTasks = MITTasks | TimeBlockTasks | LifeAreaTasks

// ── Core data types ───────────────────────────────────────────────────────────

export interface DailyGoal {
  id: string
  date: string             // 'YYYY-MM-DD'
  templateType: TemplateType
  dayIntention?: string    // optional theme / framing across all templates
  areaTag?: AreaTag
  // Focus-specific fields (kept as dedicated columns for backward compat)
  mainGoal: string
  task1Text: string
  task1Done: boolean
  task2Text: string
  task2Done: boolean
  // Non-focus template data (stored as jsonb)
  tasks?: TemplateTasks
  endTime: string          // 'HH:MM' 24h
  completed: boolean
  createdAt: string        // ISO
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
  /** true once endDay() is called — survives refresh via localStorage */
  dayEnded: boolean
}

// ── Completion helpers ────────────────────────────────────────────────────────

export function isGoalReadyToClose(goal: DailyGoal): boolean {
  switch (goal.templateType) {
    case 'focus':
      return goal.task1Done && goal.task2Done
    case 'mit': {
      const mit = goal.tasks as MITTasks | undefined
      return !!mit && mit.tasks.every((t) => t.done)
    }
    case 'timeblocks': {
      const tb = goal.tasks as TimeBlockTasks | undefined
      return !!tb && tb.blocks.every((b) => b.done)
    }
    case 'lifeareas': {
      const la = goal.tasks as LifeAreaTasks | undefined
      return !!la && la.areas.filter((a) => a.done).length >= 3
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
      const mit = goal.tasks as MITTasks | undefined
      if (!mit) return 0
      return Math.round((mit.tasks.filter((t) => t.done).length / 3) * 100)
    }
    case 'timeblocks': {
      const tb = goal.tasks as TimeBlockTasks | undefined
      if (!tb) return 0
      return Math.round((tb.blocks.filter((b) => b.done).length / 3) * 100)
    }
    case 'lifeareas': {
      const la = goal.tasks as LifeAreaTasks | undefined
      if (!la) return 0
      return Math.round((la.areas.filter((a) => a.done).length / 5) * 100)
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
