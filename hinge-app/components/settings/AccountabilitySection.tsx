'use client'

import { useState, useEffect } from 'react'
import { getPartner, setPartner, removePartner, type AccountabilityPartner } from '@/lib/accountability'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function AccountabilitySection() {
  const [partner, setPartnerState] = useState<AccountabilityPartner | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPartnerState(getPartner())
  }, [])

  function handleAdd() {
    setEmailError('')
    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address')
      return
    }
    const added = setPartner(email, name)
    setPartnerState(added)
    setEmail('')
    setName('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleRemove() {
    removePartner()
    setPartnerState(null)
  }

  if (!mounted) return null

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '12px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '14px',
    color: '#f5f2ea',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Section label */}
      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(245,242,234,0.35)',
          marginBottom: '12px',
        }}
      >
        Accountability partner
      </p>

      <div style={cardStyle}>
        {partner ? (
          /* Partner set — show card */
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500, marginBottom: '2px' }}>
                  {partner.name || partner.email}
                </p>
                {partner.name && (
                  <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)' }}>{partner.email}</p>
                )}
                <p style={{ fontSize: '11px', color: 'rgba(245,242,234,0.3)', marginTop: '4px' }}>
                  Added {new Date(partner.addedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleRemove}
                style={{
                  background: 'rgba(192,59,43,0.12)',
                  color: 'rgba(220,90,80,0.9)',
                  border: '1px solid rgba(192,59,43,0.25)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>

            {/* Info note */}
            <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.4)', lineHeight: 1.5, marginBottom: '10px' }}>
              Your partner gets notified when you close your day — hit or miss.
            </p>

            {/* Coming soon pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,242,234,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                }}
              >
                Email delivery coming soon
              </span>
            </div>
          </>
        ) : (
          /* No partner — show form */
          <>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(245,242,234,0.7)',
                fontWeight: 500,
                marginBottom: '14px',
              }}
            >
              Add someone to hold you accountable
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: 'rgba(245,242,234,0.4)',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  placeholder="partner@example.com"
                  style={{
                    ...inputStyle,
                    borderColor: emailError ? 'rgba(192,59,43,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                />
                {emailError && (
                  <p style={{ fontSize: '11px', color: 'rgba(220,90,80,0.9)', marginTop: '4px' }}>
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: 'rgba(245,242,234,0.4)',
                    marginBottom: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Name <span style={{ opacity: 0.6 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Their name…"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              style={{
                background: '#c8922a',
                color: '#0f0e0c',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            >
              Add partner
            </button>

            {/* Info note */}
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(245,242,234,0.35)',
                lineHeight: 1.5,
                marginTop: '12px',
              }}
            >
              Your partner gets notified when you close your day — hit or miss.
            </p>

            {/* Coming soon pill */}
            <div style={{ marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,242,234,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                }}
              >
                Email delivery coming soon
              </span>
            </div>

            {saved && (
              <p style={{ fontSize: '12px', color: '#2ab87e', marginTop: '10px' }}>✓ Partner saved</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
