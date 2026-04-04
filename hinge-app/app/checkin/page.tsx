'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CheckinNote {
  date: string
  note: string
}

const NOTES_KEY = 'hinge_checkin_notes'

function saveNote(note: string): void {
  if (typeof window === 'undefined' || !note.trim()) return
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    const existing: CheckinNote[] = raw ? (JSON.parse(raw) as CheckinNote[]) : []
    const today = new Date().toISOString().slice(0, 10)
    existing.unshift({ date: today, note: note.trim() })
    // Keep last 90 notes max
    localStorage.setItem(NOTES_KEY, JSON.stringify(existing.slice(0, 90)))
  } catch {
    // Storage unavailable — ignore
  }
}

export default function CheckinPage() {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Ensure we only mount client-side (localStorage guard)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function handleOnTrack() {
    if (note.trim()) saveNote(note)
    // Try to close the tab; fall back to /today
    if (typeof window !== 'undefined') {
      window.close()
      // If window.close() didn't work (opener rules), redirect
      setTimeout(() => router.push('/today'), 100)
    }
  }

  function handleDerailed() {
    if (note.trim()) saveNote(note)
    setSubmitted(true)
    setTimeout(() => router.push('/today'), 800)
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0f0e0c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f0e0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: '18px',
              color: 'rgba(245,242,234,0.35)',
              letterSpacing: '0.05em',
            }}
          >
            Hin.ge
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '32px 28px',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>👋</p>
              <p
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: '20px',
                  color: '#f5f2ea',
                  marginBottom: '8px',
                }}
              >
                Noted. Let&apos;s regroup.
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.4)' }}>
                Taking you to your day…
              </p>
            </div>
          ) : (
            <>
              {/* Headline */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>⏱</p>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: '24px',
                    color: '#f5f2ea',
                    fontWeight: 400,
                    lineHeight: 1.2,
                    marginBottom: '8px',
                  }}
                >
                  Still on track?
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.45)', lineHeight: 1.5 }}>
                  Quick mid-day check — is your goal still happening today?
                </p>
              </div>

              {/* Optional note */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: 'rgba(245,242,234,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                  }}
                >
                  What happened? <span style={{ opacity: 0.6 }}>(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note…"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#f5f2ea',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleOnTrack}
                  style={{
                    width: '100%',
                    background: '#2ab87e',
                    color: '#0f0e0c',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  Yes, I&apos;m on track →
                </button>
                <button
                  onClick={handleDerailed}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(245,242,234,0.75)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                >
                  I got derailed
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
