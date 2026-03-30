'use client'

import { useAppStore } from '@/lib/store'
import Toast from '@/components/ui/Toast'
import { useState, useCallback } from 'react'

const MILESTONE_DEFS = [
  { emoji: '🌱', label: 'First win', sub: 'Day 1', requiredStreak: 1 },
  { emoji: '🔥', label: 'Week one', sub: '7 days', requiredStreak: 7 },
  { emoji: '⚡', label: 'On a roll', sub: '14 days', requiredStreak: 14 },
  { emoji: '🎯', label: 'Month one', sub: '30 days', requiredStreak: 30 },
  { emoji: '💯', label: 'Century', sub: '100 days', requiredStreak: 100 },
  { emoji: '🏔️', label: 'Summit', sub: '365 days', requiredStreak: 365 },
  { emoji: '🔪', label: 'Sharp', sub: '10 specific goals', requiredStreak: 0, special: true },
  { emoji: '🤝', label: 'Teamwork', sub: '5 collab tasks', requiredStreak: 0, special: true },
]

interface MilestoneBadgeProps {
  emoji: string
  label: string
  sub: string
  earned: boolean
  onTap: () => void
}

function MilestoneBadge({ emoji, label, sub, earned, onTap }: MilestoneBadgeProps) {
  return (
    <div
      onClick={earned ? onTap : undefined}
      className={`
        flex flex-col items-center px-2.5 py-4 bg-bg-3
        border rounded-[13px] relative transition-all duration-150
        ${earned
          ? 'border-[var(--border2)] cursor-pointer hover:border-[rgba(200,146,42,0.5)] hover:bg-[var(--gold-dim)]'
          : 'border-[var(--border)] opacity-25 grayscale'
        }
      `}
    >
      {/* Earned dot */}
      {earned && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-bright" />
      )}
      <p className="text-[26px] mb-1.5">{emoji}</p>
      <p className="text-[11px] font-medium text-ink mb-0.5">{label}</p>
      <p className="text-[9px] text-ink-3">{sub}</p>
    </div>
  )
}

export default function MilestonesPage() {
  const { streaks, history, hydrated } = useAppStore()
  const [toast, setToast] = useState<string | null>(null)
  const dismiss = useCallback(() => setToast(null), [])

  if (!hydrated) return null

  const maxStreak = Math.max(streaks.current, streaks.personalBest)

  // Special milestones
  const specificGoalCount = history.filter((g) => {
    // simple heuristic: goals with a verb + over 5 words
    const words = g.mainGoal.split(/\s+/)
    return words.length >= 5
  }).length
  const collabTaskCount = history.filter((g) =>
    /\b(with|alex|team|review|pair|together|manager|colleague)\b/i.test(g.task1Text + g.task2Text)
  ).length

  function isEarned(m: typeof MILESTONE_DEFS[0]): boolean {
    if (m.special) {
      if (m.label === 'Sharp') return specificGoalCount >= 10
      if (m.label === 'Teamwork') return collabTaskCount >= 5
      return false
    }
    return maxStreak >= m.requiredStreak
  }

  const earned = MILESTONE_DEFS.filter(isEarned)
  const locked = MILESTONE_DEFS.filter((m) => !isEarned(m))

  function handleTap(m: typeof MILESTONE_DEFS[0]) {
    setToast(`${m.emoji} ${m.label} — ${m.sub}!`)
    // Confetti could be fired here in a real implementation
  }

  return (
    <div>
      <div className="px-8 pt-7 mb-5">
        <h1 className="font-serif text-[26px] text-ink leading-tight">Milestones</h1>
        <p className="text-[12px] text-ink-3 mt-0.5">Proof the habit stuck · tap any earned badge</p>
      </div>

      <div className="px-8 pb-8">
        {earned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">
              Earned
            </p>
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {earned.map((m) => (
                <MilestoneBadge
                  key={m.label}
                  {...m}
                  earned
                  onTap={() => handleTap(m)}
                />
              ))}
            </div>
          </>
        )}

        {locked.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">
              Locked
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {locked.map((m) => (
                <MilestoneBadge
                  key={m.label}
                  {...m}
                  earned={false}
                  onTap={() => {}}
                />
              ))}
            </div>
          </>
        )}

        {/* Progress note */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-ink-3">
            Current streak: <strong className="text-ink">{streaks.current}</strong> ·
            Personal best: <strong className="text-ink">{streaks.personalBest}</strong>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={dismiss} />}
    </div>
  )
}
