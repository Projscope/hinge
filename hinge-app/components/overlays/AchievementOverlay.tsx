'use client'

import { useState, useEffect } from 'react'
import type { DailyGoal } from '@/lib/types'
import { FOCUS_RANKS } from '@/lib/types'
import { requestNotificationPermission, getNotificationPrefs, saveNotificationPrefs } from '@/lib/notifications'
import { addToQueue } from '@/lib/goalQueue'

const MILESTONES: Record<number, { icon: string; message: string }> = {
  3:   { icon: '🌱', message: 'First streak — the habit is starting' },
  7:   { icon: '🔥', message: 'One week — most people quit before this' },
  14:  { icon: '⚡', message: 'Two weeks — you\'re building something real' },
  30:  { icon: '🏆', message: 'One month — this is a discipline now' },
  50:  { icon: '💎', message: 'Fifty days — elite territory' },
  100: { icon: '🏔️', message: 'A hundred days — you\'ve changed something fundamental' },
}

function getMilestone(streak: number): { icon: string; message: string } | null {
  return MILESTONES[streak] ?? null
}

function computeRank(history: DailyGoal[]) {
  const recent = history.slice(0, 30)
  if (recent.length === 0) return FOCUS_RANKS[0]
  const hits = recent.filter((g) => g.completed).length
  const rate = Math.round((hits / recent.length) * 100)
  for (let i = FOCUS_RANKS.length - 1; i >= 0; i--) {
    if (rate >= FOCUS_RANKS[i].min) return FOCUS_RANKS[i]
  }
  return FOCUS_RANKS[0]
}

interface Props {
  streakCount: number
  personalBest: number
  history: DailyGoal[]
  goal: DailyGoal
  onDone: () => void
}

export default function AchievementOverlay({ streakCount, personalBest, history, goal, onDone }: Props) {
  const [queueText, setQueueText] = useState('')
  const [queued, setQueued] = useState(false)
  const [notifStatus, setNotifStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default')
  const [notifRequesting, setNotifRequesting] = useState(false)
  const [visible, setVisible] = useState(false)

  const milestone = getMilestone(streakCount)
  const rank = computeRank(history)
  const isPersonalBest = streakCount > 0 && streakCount >= personalBest

  useEffect(() => {
    // Trigger entrance animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true))

    // Check notification permission state
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifStatus(Notification.permission as 'default' | 'granted' | 'denied')
    } else {
      setNotifStatus('unsupported')
    }

    return () => cancelAnimationFrame(raf)
  }, [])

  function handleQueueSubmit() {
    const text = queueText.trim()
    if (!text) return
    addToQueue(text, goal.areaTag ?? 'work')
    setQueueText('')
    setQueued(true)
  }

  async function handleEnableNotifications() {
    setNotifRequesting(true)
    const granted = await requestNotificationPermission()
    setNotifStatus(granted ? 'granted' : 'denied')
    if (granted) {
      const prefs = getNotificationPrefs()
      saveNotificationPrefs({
        ...prefs,
        morningEnabled: true,
        eveningEnabled: true,
      })
    }
    setNotifRequesting(false)
  }

  return (
    <>
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes overlaySlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes streakPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes milestoneGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200, 146, 42, 0); }
          50% { box-shadow: 0 0 24px 6px rgba(200, 146, 42, 0.35); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          backgroundColor: 'rgba(15, 14, 12, 0.92)',
          animation: 'overlayFadeIn 0.25s ease forwards',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 51,
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '24px 16px 40px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            animation: visible ? 'overlaySlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          {/* Header — milestone or default */}
          {milestone ? (
            <div
              className="text-center mb-6"
              style={{ animation: 'milestoneGlow 2.5s ease-in-out infinite' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(200,146,42,0.15), rgba(200,146,42,0.05))',
                  border: '1px solid rgba(200,146,42,0.35)',
                  borderRadius: '20px',
                  padding: '20px 32px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '52px', lineHeight: 1, marginBottom: '10px' }}>{milestone.icon}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif, Georgia, serif)',
                    fontSize: '22px',
                    color: '#c8922a',
                    fontWeight: 400,
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }}
                >
                  {milestone.message}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <p
                style={{
                  fontSize: '48px',
                  marginBottom: '8px',
                  animation: 'streakPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
                  display: 'block',
                }}
              >
                🎯
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: '26px',
                  color: '#f5f2ea',
                  lineHeight: 1.2,
                }}
              >
                Goal achieved
              </p>
            </div>
          )}

          {/* Streak count */}
          <div className="text-center mb-5">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '8px',
                animation: 'streakPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
              }}
            >
              <span style={{ fontSize: '72px', fontWeight: 700, color: '#c8922a', lineHeight: 1 }}>
                {streakCount}
              </span>
              <span style={{ fontSize: '28px', color: '#c8922a' }}>🔥</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.5)', marginTop: '2px' }}>
              day streak{isPersonalBest && streakCount > 1 ? ' · personal best' : ''}
            </p>
          </div>

          {/* Rank badge */}
          <div
            className="text-center mb-6"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>{rank.icon}</span>
            <span
              style={{
                fontSize: '13px',
                color: '#2ab87e',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {rank.label}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.4)' }}>· {rank.range}</span>
          </div>

          {/* Share card */}
          <div
            style={{
              background: '#141311',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(245,242,234,0.4)',
                marginBottom: '10px',
              }}
            >
              Screenshot to share
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: '16px',
                color: '#f5f2ea',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              &ldquo;{goal.mainGoal}&rdquo;
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🔥</span>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#c8922a' }}>{streakCount}</span>
                <span style={{ fontSize: '12px', color: 'rgba(245,242,234,0.5)' }}>day streak</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>{rank.icon}</span>
                <span style={{ fontSize: '11px', color: '#2ab87e', fontWeight: 500 }}>{rank.label}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(245,242,234,0.3)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                hin.ge
              </span>
            </div>
          </div>

          {/* Goal queue input */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(245,242,234,0.7)',
                marginBottom: '10px',
                fontWeight: 500,
              }}
            >
              Got something for tomorrow?
            </p>
            {queued ? (
              <p style={{ fontSize: '13px', color: '#2ab87e' }}>✓ Queued for tomorrow</p>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={queueText}
                  onChange={(e) => setQueueText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleQueueSubmit() }}
                  placeholder="Tomorrow's main goal…"
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#f5f2ea',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleQueueSubmit}
                  disabled={!queueText.trim()}
                  style={{
                    background: queueText.trim() ? '#c8922a' : 'rgba(200,146,42,0.2)',
                    color: queueText.trim() ? '#0f0e0c' : 'rgba(200,146,42,0.5)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: queueText.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  Queue
                </button>
              </div>
            )}
          </div>

          {/* Notification prompt */}
          {notifStatus === 'default' && (
            <div
              style={{
                background: 'rgba(42, 184, 126, 0.06)',
                border: '1px solid rgba(42, 184, 126, 0.2)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.7)', lineHeight: 1.4 }}>
                Enable morning reminders?
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={notifRequesting}
                style={{
                  background: '#2ab87e',
                  color: '#0f0e0c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: notifRequesting ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {notifRequesting ? 'Asking…' : 'Yes, remind me'}
              </button>
            </div>
          )}
          {notifStatus === 'granted' && (
            <p style={{ fontSize: '12px', color: 'rgba(42,184,126,0.8)', textAlign: 'center', marginBottom: '12px' }}>
              ✓ Morning reminders enabled
            </p>
          )}

          {/* Done button */}
          <button
            onClick={onDone}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 500,
              color: '#f5f2ea',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
