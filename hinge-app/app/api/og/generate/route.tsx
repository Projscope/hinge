import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const GOLD  = '#c8922a'
const BG    = '#0f0e0c'
const INK   = '#f5f2ea'
const INK2  = 'rgba(245,242,234,0.65)'
const INK4  = 'rgba(245,242,234,0.25)'
const MISS  = 'rgba(192,57,43,0.7)'
const EMPTY = 'rgba(255,255,255,0.08)'

const RANKS = [
  { min: 0,   max: 29,  label: 'Starter',         icon: '🌱' },
  { min: 30,  max: 49,  label: 'Builder',          icon: '🔨' },
  { min: 50,  max: 64,  label: 'Momentum Maker',   icon: '⚡' },
  { min: 65,  max: 79,  label: 'Consistency King', icon: '🎯' },
  { min: 80,  max: 89,  label: 'Deep Work Monk',   icon: '🧘' },
  { min: 90,  max: 100, label: 'Untouchable',      icon: '💎' },
]

function renderImage(opts: {
  displayName: string
  streak: number
  hitRate: number
  rankLabel: string
  rankIcon: string
  last14: ('hit' | 'miss' | 'none')[]
}) {
  const { displayName, streak, hitRate, rankLabel, rankIcon, last14 } = opts

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: BG, display: 'flex', flexDirection: 'column', padding: '64px 80px 48px', position: 'relative', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${GOLD} 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.10) 0%, transparent 65%)' }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: '20px', color: INK2, letterSpacing: '0.04em' }}>my</span>
            <span style={{ fontSize: '20px', color: GOLD, letterSpacing: '0.04em' }}>hinge</span>
          </div>
          {displayName ? <span style={{ fontSize: '18px', color: INK4 }}>{displayName}</span> : null}
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flex: 1, gap: '80px', alignItems: 'flex-start' }}>
          {/* Left: streak + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px' }}>
              <span style={{ fontSize: '112px', fontWeight: 800, color: GOLD, lineHeight: 1 }}>{streak}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>day</span>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>streak 🔥</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Last 14 days</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {last14.map((day, i) => (
                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '8px', background: day === 'hit' ? GOLD : day === 'miss' ? MISS : EMPTY }} />
              ))}
            </div>
          </div>

          {/* Right: rank card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '260px', background: 'rgba(200,146,42,0.07)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '20px', padding: '32px 36px', gap: '24px' }}>
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{rankIcon}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current rank</span>
              <span style={{ fontSize: '26px', fontWeight: 700, color: GOLD }}>{rankLabel}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hit rate</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: INK, lineHeight: 1 }}>{hitRate}</span>
                <span style={{ fontSize: '22px', color: INK2 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '32px' }}>
          <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.06em' }}>myhinge.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

export async function POST(req: NextRequest) {
  const { username } = await req.json() as { username: string }
  if (!username) return Response.json({ error: 'Missing username' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Resolve user_id
  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, display_name, username')
    .eq('username', username.toLowerCase())
    .eq('is_public', true)
    .maybeSingle()

  if (!profile) return Response.json({ error: 'Not found' }, { status: 404 })

  const [streakRes, goalsRes] = await Promise.all([
    supabase.from('streaks').select('current').eq('user_id', profile.user_id).maybeSingle(),
    supabase.from('daily_goals').select('date, completed').eq('user_id', profile.user_id).order('date', { ascending: false }).limit(30),
  ])

  const streak = streakRes.data?.current ?? 0
  const goals  = goalsRes.data ?? []
  const hitCount = goals.filter((g: { completed: boolean }) => g.completed).length
  const hitRate  = goals.length > 0 ? Math.round((hitCount / goals.length) * 100) : 0
  const rank = RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? RANKS[0]

  const last14 = Array.from({ length: 14 }, (_, i): 'hit' | 'miss' | 'none' => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = goals.find((g: { date: string; completed: boolean }) => g.date === dateStr)
    if (!entry) return 'none'
    return entry.completed ? 'hit' : 'miss'
  })

  // Generate PNG
  const imageResponse = renderImage({
    displayName: profile.display_name || profile.username,
    streak,
    hitRate,
    rankLabel: rank.label,
    rankIcon: rank.icon,
    last14,
  })

  const buffer = Buffer.from(await imageResponse.arrayBuffer())

  // Upload to Supabase Storage (public bucket: og-images)
  const { error } = await supabase.storage
    .from('og-images')
    .upload(`${username}.png`, buffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600',
    })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('og-images')
    .getPublicUrl(`${username}.png`)

  return Response.json({ url: publicUrl })
}
