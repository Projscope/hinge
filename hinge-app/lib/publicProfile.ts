import { createClient } from '@/lib/supabase/client'

export interface PublicProfile {
  username: string
  displayName: string
  isPublic: boolean
  createdAt: string
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' }
  if (username.length > 20) return { valid: false, error: 'Username must be 20 characters or fewer' }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: 'Only letters, numbers, and underscores allowed' }
  return { valid: true }
}

export async function getPublicProfile(): Promise<PublicProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('public_profiles')
    .select('username, display_name, is_public, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return null
  return {
    username: data.username as string,
    displayName: data.display_name as string,
    isPublic: data.is_public as boolean,
    createdAt: data.created_at as string,
  }
}

export async function savePublicProfile(
  username: string,
  displayName: string,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('public_profiles')
    .upsert({
      user_id: user.id,
      username: username.trim().toLowerCase(),
      display_name: displayName.trim(),
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Username already taken' }
    return { success: false, error: error.message }
  }
  return { success: true }
}
