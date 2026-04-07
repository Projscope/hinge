import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const GOLD    = '#c8922a'
const BG      = '#0f0e0c'
const INK     = '#f5f2ea'
const INK2    = 'rgba(245,242,234,0.65)'
const INK4    = 'rgba(245,242,234,0.25)'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // All data passed as URL params — no DB calls, instant render
  const displayName = searchParams.get('n') ?? ''
  const streak      = parseInt(searchParams.get('s') ?? '0', 10)
  const hitRate     = parseInt(searchParams.get('r') ?? '0', 10)
  const rankLabel   = searchParams.get('rl') ?? 'Starter'
  const rankIcon    = searchParams.get('ri') ?? '🌱'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 80px 40px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold gradient top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: `linear-gradient(90deg, ${GOLD} 0%, rgba(200,146,42,0.3) 60%, transparent 100%)`,
        }} />

        {/* Radial glow top-right */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '560px', height: '560px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,146,42,0.13) 0%, transparent 65%)',
        }} />

        {/* Subtle bottom glow */}
        <div style={{
          position: 'absolute', bottom: '-60px', left: '40px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%)',
        }} />

        {/* TOP ROW: logo + badge + display name */}
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
          {displayName ? (
            <span style={{ fontSize: '22px', color: INK4 }}>{displayName}</span>
          ) : null}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: 'flex', flex: 1, gap: '64px', alignItems: 'flex-start' }}>

          {/* LEFT — streak + tagline + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Streak number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
              <span style={{ fontSize: '120px', fontWeight: 800, color: GOLD, lineHeight: 1 }}>
                {streak}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '38px', color: INK, fontWeight: 600, lineHeight: 1.2 }}>day</span>
                <span style={{ fontSize: '38px', color: INK, fontWeight: 600, lineHeight: 1.2 }}>streak 🔥</span>
              </div>
            </div>

            {/* Motivational tagline */}
            <span style={{ fontSize: '26px', color: INK2, marginTop: '16px', fontStyle: 'italic' }}>
              No missed days. No shortcuts. Just results.
            </span>
          </div>

          {/* RIGHT — rank + hit rate card */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minWidth: '260px',
            background: 'rgba(200,146,42,0.07)',
            border: '1px solid rgba(200,146,42,0.22)',
            borderRadius: '20px',
            padding: '32px 36px',
            gap: '22px',
          }}>
            <span style={{ fontSize: '52px', lineHeight: 1 }}>{rankIcon}</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Current rank
              </span>
              <span style={{ fontSize: '32px', fontWeight: 700, color: GOLD }}>
                {rankLabel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', color: INK4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Hit rate
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '56px', fontWeight: 800, color: INK, lineHeight: 1 }}>
                  {hitRate}
                </span>
                <span style={{ fontSize: '26px', color: INK2 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '22px', marginTop: '28px',
        }}>
          <span style={{ fontSize: '18px', color: INK2, fontWeight: 500 }}>
            Think you can keep up? Start your streak today.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', background: GOLD, borderRadius: '8px', padding: '10px 22px' }}>
            <span style={{ fontSize: '16px', color: BG, fontWeight: 700, letterSpacing: '0.02em' }}>
              myhinge.app →
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
