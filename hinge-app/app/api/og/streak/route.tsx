import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const GOLD    = '#c8922a'
const BG      = '#0f0e0c'
const INK     = '#f5f2ea'
const INK2    = 'rgba(245,242,234,0.65)'
const INK4    = 'rgba(245,242,234,0.25)'
const HIT_CLR = '#c8922a'
const MISS    = 'rgba(192,57,43,0.7)'
const EMPTY   = 'rgba(255,255,255,0.08)'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // All data passed as URL params — no DB calls, instant render
  const displayName = searchParams.get('n') ?? ''
  const streak      = parseInt(searchParams.get('s') ?? '0', 10)
  const hitRate     = parseInt(searchParams.get('r') ?? '0', 10)
  const rankLabel   = searchParams.get('rl') ?? 'Starter'
  const rankIcon    = searchParams.get('ri') ?? '🌱'
  const dotsStr     = searchParams.get('d') ?? ''   // e.g. "hhmnhhmn..."

  // Parse dots: h=hit, m=miss, n=none
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const c = dotsStr[i] ?? 'n'
    if (c === 'h') return 'hit'
    if (c === 'm') return 'miss'
    return 'none'
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

        {/* Radial glow top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(200,146,42,0.10) 0%, transparent 65%)`,
        }} />

        {/* TOP ROW: logo + display name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: '20px', color: INK2, letterSpacing: '0.04em' }}>my</span>
            <span style={{ fontSize: '20px', color: GOLD,  letterSpacing: '0.04em' }}>hinge</span>
          </div>
          {displayName ? (
            <span style={{ fontSize: '18px', color: INK4 }}>{displayName}</span>
          ) : null}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: 'flex', flex: 1, gap: '80px', alignItems: 'flex-start' }}>

          {/* LEFT — streak + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Streak number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px' }}>
              <span style={{ fontSize: '112px', fontWeight: 800, color: GOLD, lineHeight: 1 }}>
                {streak}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>day</span>
                <span style={{ fontSize: '28px', color: INK, fontWeight: 600 }}>streak 🔥</span>
              </div>
            </div>

            {/* Dot label */}
            <span style={{ fontSize: '12px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Last 14 days
            </span>

            {/* Dot grid */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {last14.map((day, i) => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: day === 'hit' ? HIT_CLR : day === 'miss' ? MISS : EMPTY,
                }} />
              ))}
            </div>
          </div>

          {/* RIGHT — rank + hit rate card */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minWidth: '260px',
            background: 'rgba(200,146,42,0.07)',
            border: '1px solid rgba(200,146,42,0.2)',
            borderRadius: '20px',
            padding: '32px 36px',
            gap: '24px',
          }}>
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{rankIcon}</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Current rank
              </span>
              <span style={{ fontSize: '26px', fontWeight: 700, color: GOLD }}>
                {rankLabel}
              </span>
            </div>

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

        {/* BOTTOM: site URL */}
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
    }
  )
}
