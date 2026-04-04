const KEY = 'hinge_public_snapshot'

export interface PublicSnapshot {
  streakCurrent: number
  streakPersonalBest: number
  hitRate30: number // 0–100
  rankLabel: string
  rankIcon: string
  last14: Array<'hit' | 'miss' | 'none'> // index 0 = today, 13 = 13 days ago
  displayName: string
  username: string
  updatedAt: string
}

export function getPublicSnapshot(): PublicSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PublicSnapshot
  } catch {
    return null
  }
}

export function updatePublicSnapshot(snapshot: PublicSnapshot): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(snapshot))
}
