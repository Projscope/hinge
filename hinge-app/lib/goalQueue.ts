import { createClient } from '@/lib/supabase/client'
import type { AreaTag } from './types'

export interface QueueItem {
  id: string
  text: string
  areaTag: AreaTag
  createdAt: string
}

export async function loadQueue(): Promise<QueueItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goal_queue')
    .select('id, text, area_tag, created_at')
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    text: row.text as string,
    areaTag: row.area_tag as AreaTag,
    createdAt: row.created_at as string,
  }))
}

export async function addToQueue(text: string, areaTag: AreaTag): Promise<QueueItem | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('goal_queue')
    .insert({ text: text.trim(), area_tag: areaTag, user_id: user.id })
    .select('id, text, area_tag, created_at')
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    text: data.text as string,
    areaTag: data.area_tag as AreaTag,
    createdAt: data.created_at as string,
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
