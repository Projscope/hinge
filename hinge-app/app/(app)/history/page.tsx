'use client'

import { useAppStore } from '@/lib/store'
import Pill from '@/components/ui/Pill'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'

// Free users see all history; paywall applies only to Pro-exclusive features
const PAYWALL_THRESHOLD = Infinity

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function HistoryPage() {
  const { history, today, plan, hydrated } = useAppStore()

  if (!hydrated) return null

  const allGoals = today
    ? [today, ...history].filter((g, i, arr) => arr.findIndex((x) => x.date === g.date) === i)
    : history

  const recentGoals = allGoals.slice(0, PAYWALL_THRESHOLD)
  const lockedGoals = allGoals.slice(PAYWALL_THRESHOLD)

  return (
    <div>
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">History</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">Every goal you&apos;ve set, and whether you hit it</p>
        </div>
        <Pill variant="neutral">{allGoals.length} entries</Pill>
      </div>

      <div className="px-8 pb-8">
        {recentGoals.length === 0 && (
          <p className="text-ink-3 text-[14px]">No goals yet. Start your first morning setup.</p>
        )}

        {recentGoals.length > 0 && (
          <>
            <SectionTitle>All goals</SectionTitle>
            {recentGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                  <p className="text-[14px] font-medium text-ink">{goal.mainGoal}</p>
                </div>
                <Pill variant={goal.completed ? 'teal' : goal.completed === false ? 'red' : 'neutral'}>
                  {goal.completed ? 'Hit ✓' : 'Missed'}
                </Pill>
              </div>
            ))}
          </>
        )}

        {/* Paywall wall */}
        {lockedGoals.length > 0 && plan === 'free' && (
          <div className="mt-5">
            <SectionTitle>Beyond 7 days — Pro</SectionTitle>
            <div className="relative">
              {/* Blurred content */}
              <div className="blur-locked select-none pointer-events-none">
                {lockedGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                      <p className="text-[14px] font-medium text-ink">
                        {'█'.repeat(Math.floor(Math.random() * 10) + 10)}
                      </p>
                    </div>
                    <Pill variant={goal.completed ? 'teal' : 'red'}>
                      {goal.completed ? 'Hit ✓' : 'Missed'}
                    </Pill>
                  </div>
                ))}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(14,13,11,0.75)] rounded-[12px] px-3.5 py-4 text-center">
                <p className="text-[18px] mb-1.5">🔒</p>
                <p className="text-[12px] font-medium text-ink mb-2 leading-snug">
                  Your full history is waiting.<br />Upgrade to see every goal you&apos;ve set.
                </p>
                <Button size="sm">Unlock with Pro — $4/mo</Button>
              </div>
            </div>
          </div>
        )}

        {/* Pro users see everything */}
        {lockedGoals.length > 0 && plan === 'pro' && (
          <div className="mt-5">
            <SectionTitle>Full history</SectionTitle>
            {lockedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                  <p className="text-[14px] font-medium text-ink">{goal.mainGoal}</p>
                </div>
                <Pill variant={goal.completed ? 'teal' : 'red'}>
                  {goal.completed ? 'Hit ✓' : 'Missed'}
                </Pill>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
