'use client'

import { useEffect, useState } from 'react'
import type { DailyGoal } from '@/lib/types'

interface Props {
  history: DailyGoal[]
  streaks: { current: number; personalBest: number; lastActiveDate: string | null }
  onDismiss: () => void
}

const SESSION_KEY = 'hinge_comeback_dismissed'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function ComebackBanner({ history, streaks, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const [lastStreakLength, setLastStreakLength] = useState(0)

  useEffect(() => {
    // Guard sessionStorage access
    if (typeof window === 'undefined') return

    // Already dismissed this session
    if (sessionStorage.getItem(SESSION_KEY)) return

    // Only show if current streak is exactly 1 (just started after a gap)
    if (streaks.current !== 1) return

    const today = todayStr()

    // Find the last completed goal before today
    const sorted = [...history]
      .filter((g) => g.date < today && g.completed)
      .sort((a, b) => b.date.localeCompare(a.date))

    if (sorted.length === 0) return

    const lastCompletedDate = sorted[0].date

    // Compute gap in days between last completed and today
    const lastDate = new Date(lastCompletedDate + 'T00:00:00')
    const todayDate = new Date(today + 'T00:00:00')
    const gapDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000)

    // Only show if gap was >= 3 days (meaning at least 2 missed days in between)
    if (gapDays < 3) return

    // Find how long the streak before the gap was
    // Walk backwards from the last completed date, counting consecutive hits
    let run = 0
    const cursor = new Date(lastCompletedDate + 'T00:00:00')
    while (true) {
      const ds = cursor.toISOString().slice(0, 10)
      const goal = history.find((g) => g.date === ds)
      if (!goal || !goal.completed) break
      run++
      cursor.setDate(cursor.getDate() - 1)
    }

    setLastStreakLength(run)
    setVisible(true)
  }, [history, streaks])

  function dismiss() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1')
    }
    setVisible(false)
    onDismiss()
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-[72px] left-0 right-0 z-40 mx-auto max-w-md px-4"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="bg-bg border-t border-[rgba(200,146,42,0.3)] rounded-[16px] px-5 py-4 shadow-[0_-4px_32px_rgba(0,0,0,0.5)]"
        style={{ border: '1px solid rgba(200,146,42,0.25)', borderTop: '2px solid rgba(200,146,42,0.4)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[16px] font-serif text-ink mb-1">🔄 You&apos;re back.</p>
            <p className="text-[12px] text-ink-3 leading-relaxed">
              {lastStreakLength > 0
                ? `Last streak: ${lastStreakLength} day${lastStreakLength !== 1 ? 's' : ''}. Today counts.`
                : 'Today counts.'}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-ink-4 text-[16px] leading-none mt-0.5 hover:text-ink transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <button
          onClick={dismiss}
          className="mt-3 text-[12px] font-medium text-gold hover:opacity-80 transition-opacity"
        >
          Keep going →
        </button>
      </div>
    </div>
  )
}
