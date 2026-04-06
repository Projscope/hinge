import { localDateStr } from './dateUtils'
import { createClient } from './supabase/client'

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

export async function getWeeklyAnchor(): Promise<WeeklyAnchor | null> {
  const supabase = createClient()
  const weekStart = getCurrentWeekStart()

  const { data, error } = await supabase
    .from('weekly_anchors')
    .select('text, week_start, created_at')
    .eq('week_start', weekStart)
    .maybeSingle()

  if (error || !data) return null

  return {
    text: data.text,
    weekStart: data.week_start,
    createdAt: data.created_at,
  }
}

export async function setWeeklyAnchor(text: string): Promise<WeeklyAnchor> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const weekStart = getCurrentWeekStart()
  const now = new Date().toISOString()

  await supabase
    .from('weekly_anchors')
    .upsert(
      { user_id: user.id, week_start: weekStart, text: text.trim(), updated_at: now },
      { onConflict: 'user_id,week_start' }
    )

  return {
    text: text.trim(),
    weekStart,
    createdAt: now,
  }
}
