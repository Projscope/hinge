import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const GOLD    = '#c8922a'
const BG      = '#0f0e0c'
const INK     = '#f5f2ea'
const INK2    = 'rgba(245,242,234,0.65)'
const INK4    = 'rgba(245,242,234,0.25)'
const HIT_CLR = '#c8922a'
const MISS    = 'rgba(192,57,43,0.7)'
const EMPTY   = 'rgba(255,255,255,0.08)'

const RANKS = [
  { min: 0,   max: 29,  label: 'Starter',         icon: '🌱' },
  { min: 30,  max: 49,  label: 'Builder',          icon: '🔨' },
  { min: 50,  max: 64,  label: 'Momentum Maker',   icon: '⚡' },
  { min: 65,  max: 79,  label: 'Consistency King', icon: '🎯' },
  { min: 80,  max: 89,  label: 'Deep Work Monk',   icon: '🧘' },
  { min: 90,  max: 100, label: 'Untouchable',      icon: '💎' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('u')
  if (!username) return new Response('Missing username', { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Resolve user_id from username
  const { data: profileData } = await supabase
    .from('public_profiles')
    .select('user_id, display_name, username')
    .eq('username', username.toLowerCase())
    .eq('is_public', true)
    .maybeSingle()

  if (!profileData) return new Response('Not found', { status: 404 })

  const userId = profileData.user_id
  const displayName = profileData.display_name || profileData.username

  // 2. Fetch streak + last 30 goals in parallel
  const [streakRes, goalsRes] = await Promise.all([
    supabase.from('streaks').select('current, personal_best').eq('user_id', userId).maybeSingle(),
    supabase.from('daily_goals').select('date, completed').eq('user_id', userId).order('date', { ascending: false }).limit(30),
  ])

  const streak = streakRes.data?.current ?? 0
  const goals  = goalsRes.data ?? []

  // 3. Hit rate from last 30
  const hitCount = goals.filter((g: { completed: boolean }) => g.completed).length
  const hitRate  = goals.length > 0 ? Math.round((hitCount / goals.length) * 100) : 0

  // 4. Rank
  const rank = RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? RANKS[0]

  // 5. Last 14 days dot grid
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = goals.find((g: { date: string; completed: boolean }) => g.date === dateStr)
    if (!entry) return 'none'
    return entry.completed ? 'hit' : 'miss'
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px 48px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold gradient top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(90deg, ${GOLD} 0%, transparent 70%)`,
        }} />

        {/* Subtle radial glow top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(200,146,42,0.10) 0%, transparent 65%)`,
        }} />

        {/* ── TOP ROW: logo + display name ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
            <span style={{ fontSize: '20px', color: INK2, letterSpacing: '0.04em' }}>my</span>
            <span style={{ fontSize: '20px', color: GOLD,  letterSpacing: '0.04em' }}>hinge</span>
          </div>
          {/* Display name */}
          <span style={{ fontSize: '18px', color: INK4 }}>{displayName}</span>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: 'flex', flex: 1, gap: '80px', alignItems: 'flex-start' }}>

          {/* LEFT — streak + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px' }}>
              <span style={{ fontSize: '112px', fontWeight: 800, color: GOLD, lineHeight: 1 }}>
                {streak}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>day</span>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>streak 🔥</span>
              </div>
            </div>

            {/* 14-day dot grid label */}
            <span style={{ fontSize: '12px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Last 14 days
            </span>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {last14.map((day, i) => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: day === 'hit' ? HIT_CLR : day === 'miss' ? MISS : EMPTY,
                }} />
              ))}
            </div>
          </div>

          {/* RIGHT — rank + hit rate */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minWidth: '260px',
            background: 'rgba(200,146,42,0.07)',
            border: '1px solid rgba(200,146,42,0.2)',
            borderRadius: '20px',
            padding: '32px 36px',
            gap: '24px',
          }}>
            {/* Rank icon */}
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{rank.icon}</span>

            {/* Rank label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Current rank
              </span>
              <span style={{ fontSize: '26px', fontWeight: 700, color: GOLD }}>
                {rank.label}
              </span>
            </div>

            {/* Hit rate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Hit rate
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: INK, lineHeight: 1 }}>
                  {hitRate}
                </span>
                <span style={{ fontSize: '22px', color: INK2 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: site URL ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '20px', marginTop: '32px',
        }}>
          <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.06em' }}>
            myhinge.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'image/png',
      },
    }
  )
}
