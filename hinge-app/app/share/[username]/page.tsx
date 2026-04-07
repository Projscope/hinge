import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'myhinge.app'
  const proto = headersList.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

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

function buildOgUrl(data: NonNullable<Awaited<ReturnType<typeof getShareData>>>, baseUrl: string) {
  const p = new URLSearchParams({
    n: data.displayName,
    s: String(data.streak),
    r: String(data.hitRate),
    rl: data.rankLabel,
    ri: data.rankIcon,
    d: data.dots,
  })
  return `${baseUrl}/api/og/streak?${p.toString()}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const [data, baseUrl] = await Promise.all([getShareData(username), getBaseUrl()])

  if (!data) return { title: 'Profile not found — myhinge' }

  const ogImage = buildOgUrl(data, baseUrl)
  const title = `${data.displayName} is on a ${data.streak}-day streak 🔥`
  const description = `${data.rankLabel} · ${data.hitRate}% hit rate. One goal per day. Every day.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/share/${username}`,
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

  const ogImageUrl = buildOgUrl(data, await getBaseUrl())

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
