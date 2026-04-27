import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://myhinge.app'

const RANKS = [
  { min: 0,   max: 29,  label: 'Starter',         icon: '🌱' },
  { min: 30,  max: 49,  label: 'Builder',          icon: '🔨' },
  { min: 50,  max: 64,  label: 'Momentum Maker',   icon: '⚡' },
  { min: 65,  max: 79,  label: 'Consistency King', icon: '🎯' },
  { min: 80,  max: 89,  label: 'Deep Work Monk',   icon: '🧘' },
  { min: 90,  max: 100, label: 'Untouchable',      icon: '💎' },
]

interface Props {
  params: Promise<{ username: string }>
  children: React.ReactNode
}

async function getProfileMeta(username: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, display_name, username')
    .eq('username', username.toLowerCase())
    .eq('is_public', true)
    .maybeSingle()

  if (!profile) return null

  const [streakRes, goalsRes] = await Promise.all([
    supabase
      .from('streaks')
      .select('current, last_active_date')
      .eq('user_id', profile.user_id)
      .maybeSingle(),
    supabase
      .from('daily_goals_view')
      .select('date, completed')
      .eq('user_id', profile.user_id)
      .order('date', { ascending: false })
      .limit(30),
  ])

  const rawStreak = streakRes.data?.current ?? 0
  const lastActive = (streakRes.data?.last_active_date as string | null) ?? null
  const todayStr = new Date().toISOString().slice(0, 10)
  const yday = new Date(); yday.setDate(yday.getDate() - 1)
  const ydayStr = yday.toISOString().slice(0, 10)
  const streak = lastActive === todayStr || lastActive === ydayStr ? rawStreak : 0

  const goals = goalsRes.data ?? []
  const hitRate = goals.length > 0 ? Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) : 0
  const rank = RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? RANKS[0]

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const entry = goals.find((g) => g.date === ds)
    if (!entry) return 'n'
    return entry.completed ? 'h' : 'm'
  }).join('')

  return {
    displayName: (profile.display_name || profile.username) as string,
    username: profile.username as string,
    streak,
    hitRate,
    rankLabel: rank.label,
    rankIcon: rank.icon,
    last14,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const data = await getProfileMeta(username).catch(() => null)

  const title = data
    ? `${data.displayName} · ${data.streak}🔥 streak — myhinge`
    : `@${username}'s streak page — myhinge`

  const description = data
    ? `${data.rankIcon} ${data.rankLabel} · ${data.hitRate}% hit rate. One goal a day, every day.`
    : 'Public streak profile on myhinge — one goal per day.'

  const ogImage = data
    ? `${BASE_URL}/api/og/streak?n=${encodeURIComponent(data.displayName)}&s=${data.streak}&r=${data.hitRate}&rl=${encodeURIComponent(data.rankLabel)}&ri=${encodeURIComponent(data.rankIcon)}&d=${data.last14}`
    : `${BASE_URL}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/u/${username}`,
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/u/${username}`,
    },
  }
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
