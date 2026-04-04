'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPublicSnapshot, type PublicSnapshot } from '@/lib/publicSnapshot'

type DotStatus = 'hit' | 'miss' | 'none'

function HeatmapDot({ status }: { status: DotStatus }) {
  const colors: Record<DotStatus, string> = {
    hit: '#2ab87e',
    miss: 'rgba(192,59,43,0.7)',
    none: 'rgba(255,255,255,0.08)',
  }
  return (
    <div
      style={{
        width: '14px',
        height: '14px',
        borderRadius: '4px',
        background: colors[status],
        flexShrink: 0,
      }}
      title={status === 'hit' ? 'Goal hit' : status === 'miss' ? 'Goal missed' : 'No data'}
    />
  )
}

export default function PublicProfilePage() {
  const [snapshot, setSnapshot] = useState<PublicSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const data = getPublicSnapshot()
    if (!data) {
      setNotFound(true)
    } else {
      setSnapshot(data)
    }
    setLoading(false)
  }, [])

  // Pad last14 to exactly 14 entries
  const last14: DotStatus[] = snapshot
    ? [...snapshot.last14, ...Array<DotStatus>(14).fill('none')].slice(0, 14)
    : Array<DotStatus>(14).fill('none')

  // Split into two rows of 7 (most recent first)
  const row1 = last14.slice(0, 7)  // days 0–6
  const row2 = last14.slice(7, 14) // days 7–13

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0f0e0c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '2px solid rgba(200,146,42,0.3)',
            borderTopColor: '#c8922a',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (notFound || !snapshot) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0f0e0c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '22px',
              color: '#f5f2ea',
              marginBottom: '10px',
            }}
          >
            Profile not found
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(245,242,234,0.45)', marginBottom: '24px', lineHeight: 1.5 }}>
            This streak page doesn&apos;t exist or hasn&apos;t been made public yet.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: '#c8922a',
              color: '#0f0e0c',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Join Hin.ge
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0e0c',
        padding: '0 16px 48px',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 0',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: '20px',
            color: '#c8922a',
            textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          Hin.ge
        </Link>
        <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.3)' }}>
          Updated {new Date(snapshot.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Profile header */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '28px 24px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(200,146,42,0.4), rgba(42,184,126,0.3))',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            {snapshot.displayName.charAt(0).toUpperCase() || '?'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '22px',
              color: '#f5f2ea',
              fontWeight: 400,
              marginBottom: '4px',
            }}
          >
            {snapshot.displayName}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.4)' }}>
            @{snapshot.username} · Hin.ge user
          </p>
        </div>

        {/* Streak */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '28px 24px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: '72px',
                fontWeight: 700,
                color: '#c8922a',
                lineHeight: 1,
              }}
            >
              {snapshot.streakCurrent}
            </span>
            <span style={{ fontSize: '36px' }}>🔥</span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(245,242,234,0.5)' }}>
            day streak
            {snapshot.streakPersonalBest > 0 && (
              <span style={{ color: 'rgba(245,242,234,0.3)' }}>
                {' '}· best: {snapshot.streakPersonalBest}
              </span>
            )}
          </p>

          {/* Rank */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '14px',
              background: 'rgba(42,184,126,0.08)',
              border: '1px solid rgba(42,184,126,0.2)',
              borderRadius: '999px',
              padding: '6px 14px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{snapshot.rankIcon}</span>
            <span style={{ fontSize: '13px', color: '#2ab87e', fontWeight: 500 }}>
              {snapshot.rankLabel}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(245,242,234,0.35)' }}>
              · {snapshot.hitRate30}% hit rate
            </span>
          </div>
        </div>

        {/* 14-day heatmap */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '20px 24px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(245,242,234,0.35)',
              marginBottom: '14px',
            }}
          >
            Last 14 days
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {row1.map((status, i) => (
                <HeatmapDot key={i} status={status} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {row2.map((status, i) => (
                <HeatmapDot key={i + 7} status={status} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
            {([['hit', '#2ab87e', 'Hit'], ['miss', 'rgba(192,59,43,0.7)', 'Missed'], ['none', 'rgba(255,255,255,0.08)', 'No data']] as const).map(([, color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.35)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.4)', marginBottom: '14px' }}>
            Build your own streak with Hin.ge
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: '#c8922a',
              color: '#0f0e0c',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Join Hin.ge →
          </Link>
        </div>
      </div>
    </div>
  )
}
