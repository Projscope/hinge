import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache for 1 hour, stale for 24 hours
export const revalidate = 3600

const GOLD = '#c8922a'
const BG = '#0f0e0c'
const BG2 = '#16140f'
const INK = '#f5f2ea'
const INK3 = 'rgba(245,242,234,0.45)'
const MISS = 'rgba(192,57,43,0.6)'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('u')

  if (!username) {
    return new Response('Missing username', { status: 400 })
  }

  // Fetch public data via anon key (RLS allows public profiles)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get profile + streaks in parallel
  const [profileRes, streakRes, goalsRes] = await Promise.all([
    supabase
      .from('public_profiles')
      .select('display_name, username, user_id')
      .eq('username', username.toLowerCase())
      .eq('is_public', true)
      .maybeSingle(),
    supabase
      .from('streaks')
      .select('current, personal_best')
      .eq('user_id',
        supabase
          .from('public_profiles')
          .select('user_id')
          .eq('username', username.toLowerCase())
          .single()
      )
      .maybeSingle(),
    supabase
      .from('daily_goals')
      .select('date, completed')
      .order('date', { ascending: false })
      .limit(14),
  ])

  if (!profileRes.data) {
    return new Response('Not found', { status: 404 })
  }

  const profile = profileRes.data
  const userId = profile.user_id

  // Re-fetch streak and goals with the actual user_id
  const [streakRes2, goalsRes2] = await Promise.all([
    supabase.from('streaks').select('current, personal_best').eq('user_id', userId).maybeSingle(),
    supabase.from('daily_goals').select('date, completed').eq('user_id', userId).order('date', { ascending: false }).limit(14),
  ])

  const streak = streakRes2.data?.current ?? 0
  const goals = goalsRes2.data ?? []

  // Build last 14 days
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = goals.find((g: { date: string; completed: boolean }) => g.date === dateStr)
    if (!entry) return 'none'
    return entry.completed ? 'hit' : 'miss'
  })

  // Determine rank
  const hitCount = goals.filter((g: { completed: boolean }) => g.completed).length
  const hitRate = goals.length > 0 ? Math.round((hitCount / goals.length) * 100) : 0

  const RANKS = [
    { min: 0,  max: 29,  label: 'Starter',          icon: '🌱' },
    { min: 30, max: 49,  label: 'Builder',           icon: '🔨' },
    { min: 50, max: 64,  label: 'Momentum Maker',    icon: '⚡' },
    { min: 65, max: 79,  label: 'Consistency King',  icon: '🎯' },
    { min: 80, max: 89,  label: 'Deep Work Monk',    icon: '🧘' },
    { min: 90, max: 100, label: 'Untouchable',       icon: '💎' },
  ]
  const rank = RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? RANKS[0]

  const displayName = profile.display_name || profile.username

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '72px 96px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, rgba(200,146,42,0.12) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />

        {/* myhinge logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '18px', color: INK3, letterSpacing: '0.05em' }}>my</span>
          <span style={{ fontSize: '18px', color: GOLD, letterSpacing: '0.05em' }}>hinge</span>
        </div>

        {/* Display name */}
        <div style={{
          fontSize: '22px',
          color: INK3,
          marginBottom: '12px',
          letterSpacing: '0.01em',
        }}>
          {displayName}
        </div>

        {/* Streak number */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <span style={{
            fontSize: '96px',
            color: GOLD,
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {streak}
          </span>
          <span style={{
            fontSize: '32px',
            color: INK,
            fontWeight: 500,
          }}>
            day streak 🔥
          </span>
        </div>

        {/* Rank badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(200,146,42,0.12)',
          border: `1px solid rgba(200,146,42,0.3)`,
          borderRadius: '100px',
          padding: '8px 20px',
          marginBottom: '40px',
        }}>
          <span style={{ fontSize: '22px' }}>{rank.icon}</span>
          <span style={{ fontSize: '18px', color: GOLD, fontWeight: 600 }}>{rank.label}</span>
          <span style={{ fontSize: '14px', color: INK3, marginLeft: '4px' }}>· {hitRate}% hit rate</span>
        </div>

        {/* 14-day dot grid */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {last14.map((day, i) => (
            <div
              key={i}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background:
                  day === 'hit'  ? GOLD :
                  day === 'miss' ? MISS :
                  'rgba(255,255,255,0.07)',
              }}
            />
          ))}
          <span style={{ fontSize: '13px', color: INK3, marginLeft: '8px' }}>last 14 days</span>
        </div>

        {/* Bottom right: myhinge.app */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '96px',
          fontSize: '16px',
          color: INK3,
          letterSpacing: '0.04em',
        }}>
          myhinge.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  )
}
