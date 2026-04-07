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
    <div className="min-h-screen bg-[#0f0e0c] flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Logo */}
      <p className="font-serif text-[20px] mb-6 tracking-wide">
        <span style={{ color: 'rgba(245,242,234,0.6)' }}>my</span>
        <span style={{ color: '#c8922a' }}>hinge</span>
      </p>

      {/* FOMO headline */}
      <h1 className="text-[rgba(245,242,234,0.95)] font-semibold text-[22px] leading-snug mb-2 max-w-sm">
        {data.displayName} hasn&apos;t missed a day.<br />
        <span style={{ color: '#c8922a' }}>Can you keep up?</span>
      </h1>
      <p className="text-[rgba(245,242,234,0.4)] text-[13px] mb-8 max-w-xs">
        One goal. Every day. No excuses. Join {data.streak > 1 ? `${data.streak} days` : 'the streak'} in the making.
      </p>

      {/* OG image */}
      <div className="w-full max-w-2xl rounded-[16px] overflow-hidden border border-[rgba(200,146,42,0.25)] mb-8 shadow-[0_0_60px_rgba(200,146,42,0.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ogImageUrl} alt={`${data.displayName}'s streak`} className="w-full" />
      </div>

      {/* Primary CTA */}
      <Link
        href="/"
        className="w-full max-w-sm bg-[#c8922a] text-[#0f0e0c] text-[15px] font-bold py-4 px-8 rounded-[12px] no-underline text-center hover:opacity-90 active:scale-[0.98] transition-all mb-3 block"
      >
        Start your streak — it&apos;s free →
      </Link>

      {/* Secondary CTA */}
      <Link
        href={`/u/${username}`}
        className="w-full max-w-sm border border-[rgba(200,146,42,0.25)] text-[rgba(245,242,234,0.6)] text-[13px] font-medium py-3 px-6 rounded-[12px] no-underline text-center hover:border-[rgba(200,146,42,0.5)] hover:text-[rgba(245,242,234,0.85)] transition-all block mb-8"
      >
        View {data.displayName}&apos;s full profile
      </Link>

      {/* Social proof */}
      <p className="text-[rgba(245,242,234,0.2)] text-[11px] tracking-wide uppercase">
        One goal per day. Every day.
      </p>
    </div>
  )
}
