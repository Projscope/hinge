const KEY = 'hinge_public_profile'

export interface PublicProfile {
  username: string
  displayName: string
  isPublic: boolean
  createdAt: string
}

export function getPublicProfile(): PublicProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PublicProfile
  } catch {
    return null
  }
}

export function setPublicProfile(username: string, displayName: string): PublicProfile {
  const existing = getPublicProfile()
  const profile: PublicProfile = {
    username: username.trim().toLowerCase(),
    displayName: displayName.trim(),
    isPublic: existing?.isPublic ?? true,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(profile))
  }
  return profile
}

export function updatePublicProfileVisibility(isPublic: boolean): void {
  if (typeof window === 'undefined') return
  const existing = getPublicProfile()
  if (!existing) return
  localStorage.setItem(KEY, JSON.stringify({ ...existing, isPublic }))
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or fewer' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Only letters, numbers, and underscores allowed' }
  }
  return { valid: true }
}
