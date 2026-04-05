'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/types'
import UpgradeButton from './UpgradeButton'

interface BillingSectionProps {
  plan: Plan
}

export default function BillingSection({ plan }: BillingSectionProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('year')
  const [portalLoading, setPortalLoading] = useState(false)

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '12px',
  }

  return (
    <div style={{ marginTop: '28px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,242,234,0.35)', marginBottom: '12px' }}>
        Plan &amp; billing
      </p>

      {plan === 'pro' ? (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500 }}>Pro plan</p>
              <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)', marginTop: '2px' }}>
                All features unlocked
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#c8922a', background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.25)', borderRadius: '20px', padding: '3px 10px' }}>
              Active
            </span>
          </div>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              color: 'rgba(245,242,234,0.7)',
              cursor: portalLoading ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {portalLoading ? 'Opening…' : 'Manage subscription →'}
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 600, marginBottom: '4px' }}>
            Upgrade to Pro
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.5)', marginBottom: '16px', lineHeight: 1.5 }}>
            Full history, pattern insights, streak freeze, focus rank &amp; more.
          </p>

          {/* Interval toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', marginBottom: '14px' }}>
            {(['month', 'year'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: interval === i ? '#c8922a' : 'transparent',
                  color: interval === i ? '#0f0e0c' : 'rgba(245,242,234,0.5)',
                }}
              >
                {i === 'month' ? '$4 / month' : '$39 / year'}
                {i === 'year' && (
                  <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.8 }}>save 20%</span>
                )}
              </button>
            ))}
          </div>

          <UpgradeButton
            interval={interval}
            className="w-full"
            style={{
              width: '100%',
              background: '#c8922a',
              color: '#0f0e0c',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            } as React.CSSProperties}
          >
            Upgrade now →
          </UpgradeButton>
        </div>
      )}
    </div>
  )
}
