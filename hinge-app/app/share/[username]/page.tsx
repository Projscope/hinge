import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://myhinge.app'

// Serve the OG image through our own domain proxy — Twitter can reach myhinge.app
// (proven: it reads HTML from it) but can't fetch images directly from Supabase CDN.
const storageOgUrl = (username: string) =>
  `${BASE_URL}/api/og/download?u=${encodeURIComponent(username)}`

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
}

async function getShareData(username: string) {
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
    supabase.from('streaks').select('current').eq('user_id', profile.user_id).maybeSingle(),
    supabase.from('daily_goals').select('date, completed').eq('user_id', profile.user_id).order('date', { ascending: false }).limit(30),
  ])

  const streak = streakRes.data?.current ?? 0
  const goals  = goalsRes.data ?? []
  const hitCount = goals.filter((g: { completed: boolean }) => g.completed).length
  const hitRate  = goals.length > 0 ? Math.round((hitCount / goals.length) * 100) : 0
  const rank = RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? RANKS[0]

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = goals.find((g: { date: string }) => g.date === dateStr) as { completed: boolean } | undefined
    if (!entry) return 'n'
    return entry.completed ? 'h' : 'm'
  }).join('')

  return {
    displayName: profile.display_name || profile.username,
    streak,
    hitRate,
    rankLabel: rank.label,
    rankIcon: rank.icon,
    dots: last14,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params

  // og:image URL is purely derived from username — always include it regardless
  // of whether the DB call succeeds. This prevents Twitter from seeing a page
  // with no og:image when generateMetadata times out or returns null.
  const ogImage = storageOgUrl(username)

  // Try to enrich title/description from DB, but fall back gracefully
  const data = await getShareData(username).catch(() => null)
  const title = data
    ? `${data.displayName} is on a ${data.streak}-day streak 🔥`
    : `@${username}'s streak — myhinge`
  const description = data
    ? `${data.rankLabel} · ${data.hitRate}% hit rate. One goal per day. Every day.`
    : 'One goal per day. Every day.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/share/${username}`,
      siteName: 'myhinge',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { username } = await params
  const data = await getShareData(username)

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0e0c] flex items-center justify-center">
        <p className="text-[rgba(245,242,234,0.4)] text-[15px]">Profile not found.</p>
      </div>
    )
  }

  const ogImageUrl = storageOgUrl(username)

  return (
    <div className="min-h-screen bg-[#0f0e0c] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-[22px] mb-8">
        <span style={{ color: 'rgba(245,242,234,0.7)' }}>my</span>
        <span style={{ color: '#c8922a' }}>hinge</span>
      </p>

      <div className="w-full max-w-sm rounded-[16px] overflow-hidden border border-[rgba(200,146,42,0.2)] mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ogImageUrl} alt={`${data.displayName}'s streak`} className="w-full" />
      </div>

      <p className="text-[rgba(245,242,234,0.5)] text-[14px] mb-6">
        {data.displayName} is on a {data.streak}-day streak on myhinge.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[220px]">
        <Link
          href={`/u/${username}`}
          className="bg-[#c8922a] text-[#0f0e0c] text-[13px] font-semibold py-3 px-6 rounded-[10px] no-underline text-center hover:opacity-90 transition-opacity"
        >
          View full profile →
        </Link>
        <Link
          href="/"
          className="text-[rgba(245,242,234,0.4)] text-[12px] no-underline hover:text-[rgba(245,242,234,0.7)] transition-colors"
        >
          What is myhinge?
        </Link>
      </div>
    </div>
  )
}
