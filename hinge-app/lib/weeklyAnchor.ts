import { localDateStr } from './dateUtils'

const ANCHOR_KEY = 'hinge_weekly_anchor'

export interface WeeklyAnchor {
  text: string
  weekStart: string // Monday YYYY-MM-DD
  createdAt: string
}

export function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day // days back to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return localDateStr(monday)
}

export function getWeeklyAnchor(): WeeklyAnchor | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ANCHOR_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WeeklyAnchor
  } catch {
    return null
  }
}

export function setWeeklyAnchor(text: string): WeeklyAnchor {
  const anchor: WeeklyAnchor = {
    text: text.trim(),
    weekStart: getCurrentWeekStart(),
    createdAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ANCHOR_KEY, JSON.stringify(anchor))
    } catch {
      // ignore
    }
  }
  return anchor
}
