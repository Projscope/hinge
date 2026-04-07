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
  days14: string
}) {
  const { displayName, streak, hitRate, rankLabel, rankIcon, days14 } = opts

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: BG, display: 'flex', flexDirection: 'column', padding: '56px 80px 40px', position: 'relative', fontFamily: 'sans-serif' }}>
        {/* Gold gradient top border */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${GOLD} 0%, rgba(200,146,42,0.3) 60%, transparent 100%)` }} />
        {/* Radial glow top-right */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.13) 0%, transparent 65%)' }} />
        {/* Subtle bottom glow */}
        <div style={{ position: 'absolute', bottom: '-60px', left: '40px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%)' }} />

        {/* Top row: logo + name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ fontSize: '28px', color: INK2, letterSpacing: '0.04em', fontWeight: 400 }}>my</span>
              <span style={{ fontSize: '28px', color: GOLD, letterSpacing: '0.04em', fontWeight: 400 }}>hinge</span>
            </div>
            <span style={{ fontSize: '14px', color: INK4, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '4px', padding: '4px 10px' }}>
              One goal. Every day.
            </span>
          </div>
          {displayName ? <span style={{ fontSize: '22px', color: INK4 }}>{displayName}</span> : null}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, gap: '64px', alignItems: 'flex-start' }}>

          {/* Left: streak hero + tagline + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Streak number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
              <span style={{ fontSize: '120px', fontWeight: 800, color: GOLD, lineHeight: 1 }}>{streak}</span>
              <span style={{ fontSize: '38px', color: INK, fontWeight: 600, lineHeight: 1 }}>day streak 🔥</span>
            </div>

            {/* Motivational tagline */}
            <span style={{ fontSize: '26px', color: INK2, marginTop: '16px', fontStyle: 'italic' }}>
              No missed days. No shortcuts. Just results.
            </span>

            {/* Last 14 days squares */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              {days14.split('').map((d, i) => (
                <div key={i} style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: d === '1' ? GOLD : d === '0' ? MISS : EMPTY,
                }} />
              ))}
            </div>
          </div>

          {/* Right: rank + hit rate card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '260px', background: 'rgba(200,146,42,0.07)', border: '1px solid rgba(200,146,42,0.22)', borderRadius: '20px', padding: '32px 36px', gap: '22px' }}>
            <span style={{ fontSize: '52px', lineHeight: 1 }}>{rankIcon}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current rank</span>
              <span style={{ fontSize: '32px', fontWeight: 700, color: GOLD }}>{rankLabel}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hit rate</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '56px', fontWeight: 800, color: INK, lineHeight: 1 }}>{hitRate}</span>
                <span style={{ fontSize: '26px', color: INK2 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '22px', marginTop: '28px' }}>
          <span style={{ fontSize: '18px', color: INK2, fontWeight: 500 }}>
            Think you can keep up? Start your streak today.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: GOLD, borderRadius: '8px', padding: '10px 22px' }}>
            <span style={{ fontSize: '16px', color: BG, fontWeight: 700, letterSpacing: '0.02em' }}>
              myhinge.app →
            </span>
          </div>
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

  // Build last-14 string oldest→newest: '1'=hit, '0'=miss, '-'=no data
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const g = goals[13 - i]
    if (!g) return '-'
    return g.completed ? '1' : '0'
  }).join('')

  // Generate PNG
  const imageResponse = renderImage({
    displayName: profile.display_name || profile.username,
    streak,
    hitRate,
    rankLabel: rank.label,
    rankIcon: rank.icon,
    days14: last14,
  })

  const buffer = Buffer.from(await imageResponse.arrayBuffer())

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const cacheBust = Date.now()
  const pngPath  = `${username}.png`
  const htmlPath = `${username}_${cacheBust}.html`
  // Clean PNG URL — no query params (Supabase Storage may reject unknown params)
  const pngPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/og-images/${pngPath}`

  // Minimal HTML page — no JS, just og/twitter meta tags + instant redirect.
  // Explicit width/height/type help Twitter render the image without fetching it first.
  // Twitter's bot reads this directly from the trusted Supabase CDN.
  const displayTitle = profile.display_name || profile.username
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@myhinge">
<meta name="twitter:title" content="${displayTitle} is on a ${streak}-day streak on myhinge 🔥">
<meta name="twitter:description" content="One goal. Every day. No excuses. Think you can keep up?">
<meta name="twitter:image" content="${pngPublicUrl}">
<meta name="twitter:image:width" content="1200">
<meta name="twitter:image:height" content="630">
<meta property="og:type" content="website">
<meta property="og:title" content="${displayTitle} is on a ${streak}-day streak on myhinge 🔥">
<meta property="og:description" content="One goal. Every day. No excuses. Think you can keep up?">
<meta property="og:image" content="${pngPublicUrl}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://myhinge.app/share/${username}">
</head>
<body>
<script>window.location.replace('https://myhinge.app/share/${username}')</script>
</body>
</html>`

  // Upload PNG + HTML in parallel
  const [pngUpload, htmlUpload] = await Promise.all([
    supabase.storage.from('og-images').upload(pngPath, buffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600',
    }),
    supabase.storage.from('og-images').upload(htmlPath, Buffer.from(html), {
      contentType: 'text/html; charset=utf-8',
      upsert: true,
      cacheControl: '0',
    }),
  ])

  if (pngUpload.error) return Response.json({ error: pngUpload.error.message }, { status: 500 })
  if (htmlUpload.error) return Response.json({ error: htmlUpload.error.message }, { status: 500 })

  const htmlPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/og-images/${htmlPath}`

  return Response.json({ url: pngPublicUrl, shareUrl: htmlPublicUrl })
}
