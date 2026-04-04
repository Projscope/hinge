import type { AreaTag } from './types'

export interface QueueItem {
  id: string
  text: string
  areaTag: AreaTag
  createdAt: string
}

const QUEUE_KEY = 'hinge_goal_queue'

export function loadQueue(): QueueItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Partial<QueueItem>>
    return parsed.map((item) => ({
      id: item.id ?? `queue-${Date.now()}-${Math.random()}`,
      text: item.text ?? '',
      areaTag: (item.areaTag as AreaTag) ?? 'work',
      createdAt: item.createdAt ?? new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

export function saveQueue(items: QueueItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function addToQueue(text: string, areaTag: AreaTag): QueueItem {
  const item: QueueItem = {
    id: `queue-${Date.now()}`,
    text: text.trim(),
    areaTag,
    createdAt: new Date().toISOString(),
  }
  const existing = loadQueue()
  saveQueue([...existing, item])
  return item
}

export function removeFromQueue(id: string): void {
  const existing = loadQueue()
  saveQueue(existing.filter((item) => item.id !== id))
}

export function getQueueByArea(areaTag: AreaTag): QueueItem[] {
  return loadQueue().filter((item) => item.areaTag === areaTag)
}
