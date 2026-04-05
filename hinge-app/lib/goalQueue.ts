import { createClient } from '@/lib/supabase/client'
import type { AreaTag } from './types'

export interface QueueItem {
  id: string
  text: string
  areaTag: AreaTag
  createdAt: string
  isExample: boolean
}

const ONBOARDING_EXAMPLES: { text: string; areaTag: AreaTag }[] = [
  { areaTag: 'work',     text: 'Finish [your most important work task] before end of day' },
  { areaTag: 'home',     text: 'Complete [a specific home errand or chore] today' },
  { areaTag: 'family',   text: 'Spend focused time with [a family member or friend] doing [activity]' },
  { areaTag: 'health',   text: '[Exercise / cook a healthy meal / get to bed on time] — pick one and commit' },
  { areaTag: 'personal', text: 'Make progress on [your personal project or learning goal] today' },
]

export async function loadQueue(): Promise<QueueItem[]> {
  const supabase = createClient()

  // Try with is_example column first (requires migration 005)
  const { data, error } = await supabase
    .from('goal_queue')
    .select('id, text, area_tag, created_at, is_example')
    .order('created_at', { ascending: true })

  // If is_example column doesn't exist yet, fall back without it
  if (error?.code === '42703') {
    const { data: fallback, error: fallbackError } = await supabase
      .from('goal_queue')
      .select('id, text, area_tag, created_at')
      .order('created_at', { ascending: true })

    if (fallbackError || !fallback) return []

    return fallback.map((row) => ({
      id: row.id as string,
      text: row.text as string,
      areaTag: row.area_tag as AreaTag,
      createdAt: row.created_at as string,
      isExample: false,
    }))
  }

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    text: row.text as string,
    areaTag: row.area_tag as AreaTag,
    createdAt: row.created_at as string,
    isExample: row.is_example as boolean,
  }))
}

export async function addToQueue(text: string, areaTag: AreaTag): Promise<QueueItem | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('goal_queue')
    .insert({ text: text.trim(), area_tag: areaTag, user_id: user.id })
    .select('id, text, area_tag, created_at, is_example')
    .single()

  // If is_example column doesn't exist yet, retry without it
  if (error?.code === '42703') {
    const { data: fallback, error: fallbackError } = await supabase
      .from('goal_queue')
      .insert({ text: text.trim(), area_tag: areaTag, user_id: user.id })
      .select('id, text, area_tag, created_at')
      .single()

    if (fallbackError || !fallback) return null

    return {
      id: fallback.id as string,
      text: fallback.text as string,
      areaTag: fallback.area_tag as AreaTag,
      createdAt: fallback.created_at as string,
      isExample: false,
    }
  }

  if (error || !data) return null

  return {
    id: data.id as string,
    text: data.text as string,
    areaTag: data.area_tag as AreaTag,
    createdAt: data.created_at as string,
    isExample: data.is_example as boolean,
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('goal_queue').delete().eq('id', id)
}

export async function getQueueByArea(areaTag: AreaTag): Promise<QueueItem[]> {
  const all = await loadQueue()
  return all.filter((item) => item.areaTag === areaTag)
}

export async function seedOnboardingQueue(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Check if already seeded (column may not exist if migration 005 hasn't run)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_seeded')
    .eq('id', user.id)
    .single()

  if (profileError?.code === '42703') return // column missing — skip silently
  if (!profile || profile.onboarding_seeded) return

  // Insert example items
  const rows = ONBOARDING_EXAMPLES.map((item) => ({
    user_id: user.id,
    text: item.text,
    area_tag: item.areaTag,
    is_example: true,
  }))

  await supabase.from('goal_queue').insert(rows)

  // Mark as seeded so this never runs again
  await supabase
    .from('profiles')
    .update({ onboarding_seeded: true })
    .eq('id', user.id)
}
