'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import GoalHero from '@/components/today/GoalHero'
import TaskCard from '@/components/today/TaskCard'
import OverflowLog from '@/components/today/OverflowLog'
import { AREA_TAGS } from '@/lib/types'
import StreakAtRisk from '@/components/today/StreakAtRisk'
import WeeklyAnchorBanner from '@/components/today/WeeklyAnchorBanner'
import ComebackBanner from '@/components/overlays/ComebackBanner'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import SectionTitle from '@/components/ui/SectionTitle'
import Heatmap from '@/components/layout/Heatmap'
import WeekDots from '@/components/layout/WeekDots'
import ShareCard from '@/components/snapshot/ShareCard'

type TimePeriod = 'morning' | 'afternoon' | 'evening'

function getTimePeriod(): TimePeriod {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function timeLeft(endTime: string): string {
  const now = new Date()
  const [h, m] = endTime.split(':').map(Number)
  const end = new Date(now)
  end.setHours(h, m, 0, 0)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return 'Day ended'
  const hours = Math.floor(diff / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  return `${hours}h ${mins}m left`
}

const NO_GOAL_COPY: Record<TimePeriod, { heading: string; sub: string }> = {
  morning: {
    heading: "What makes today a win?",
    sub: "60 seconds of focus now saves hours of drift later.",
  },
  afternoon: {
    heading: "There's still time.",
    sub: "Set your focus for the rest of the day — it still counts.",
  },
  evening: {
    heading: "Late start is better than no start.",
    sub: "Even an hour of focused effort builds the habit.",
  },
}

export default function TodayPage() {
  const router = useRouter()
  const { today, todayOverflow, toggleTemplateItem, addOverflow, hydrated, history, streaks, username, dayEnded } = useAppStore()
  const [showComeback, setShowComeback] = useState(true)

  const timePeriod = useMemo(() => getTimePeriod(), [])

  const templateAllDone = (() => {
    if (!today) return false
    if (today.templateType === 'focus') return today.task1Done && today.task2Done
    if (today.templateType === 'mit') return today.task1Done && today.task2Done && today.task3Done
    if (today.templateType === 'timeblocks') return today.block1Done && today.block2Done && today.block3Done
    if (today.templateType === 'lifeareas') {
      return [today.workDone, today.homeDone, today.familyDone, today.healthDone, today.personalDone].filter(Boolean).length >= 3
    }
    return false
  })()

  if (!hydrated) return null

  // ── No goal set ────────────────────────────────────────────────────────────
  if (!today) {
    const now = new Date()
    const monthName = now.toLocaleDateString('en-US', { month: 'long' })
    const copy = NO_GOAL_COPY[timePeriod]
    const yesterday = history[0] ?? null

    return (
      <div className="px-8 py-10 max-w-[680px]">
        <div className="mb-8">
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-gold mb-2">
            {formatDate(now)}
          </p>
          <h1 className="font-serif text-[32px] text-ink leading-tight mb-2">
            {copy.heading}
          </h1>
          <p className="text-[14px] text-ink-3 leading-relaxed">{copy.sub}</p>
        </div>

        <Button onClick={() => router.push('/setup')} className="w-full mb-8">
          Start morning setup →
        </Button>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3">
            {streaks.current === 0 ? (
              <>
                <p className="font-serif text-[22px] text-ink-3 leading-none">—</p>
                <p className="text-[10px] text-ink-4 mt-1">Start your streak today</p>
              </>
            ) : (
              <>
                <p className="font-serif text-[22px] text-ink leading-none">{streaks.current} 🔥</p>
                <p className="text-[10px] text-ink-3 mt-1">Day streak · keep it alive</p>
              </>
            )}
          </div>
          {yesterday ? (
            <div className={`border rounded-[12px] px-4 py-3 ${yesterday.completed ? 'bg-[rgba(26,122,101,0.08)] border-[rgba(26,122,101,0.25)]' : 'bg-bg-3 border-[var(--border)]'}`}>
              <p className={`font-serif text-[22px] leading-none ${yesterday.completed ? 'text-teal-bright' : 'text-ink-3'}`}>
                {yesterday.completed ? '✓' : '✗'}
              </p>
              <p className="text-[10px] text-ink-3 mt-1">Yesterday</p>
            </div>
          ) : (
            <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3">
              <p className="font-serif text-[22px] text-ink-3 leading-none">—</p>
              <p className="text-[10px] text-ink-4 mt-1">No history yet</p>
            </div>
          )}
        </div>

        <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink mb-0.5">Goal queue</p>
            <p className="text-[11px] text-ink-4">Pre-load goals so setup takes one tap.</p>
          </div>
          <Link href="/queue" className="text-[11px] text-gold hover:underline underline-offset-2 flex-shrink-0 ml-4">
            Open queue →
          </Link>
        </div>

        <div className="lg:hidden">
          <div className="mb-4">
            <WeekDots history={history} today={null} />
          </div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-ink-4 font-medium mb-2.5">{monthName}</p>
          <Heatmap history={history} today={null} />
          <p className="text-[10px] text-ink-4 mt-1.5">🟢 achieved &nbsp;🔴 missed</p>
        </div>

        {streaks.current >= 1 && (
          <div className="lg:hidden mt-6">
            <ShareCard streakCount={streaks.current} username={username} />
          </div>
        )}
      </div>
    )
  }

  // ── Goal set ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="px-8 pt-7 pb-0 flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">Today</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {formatDate(new Date())} ·{' '}
            <span className="text-gold">{timeLeft(today.endTime)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {dayEnded ? (
            <Pill variant={today.completed ? 'teal' : 'neutral'}>
              {today.completed ? '✓ Completed' : '✗ Missed'}
            </Pill>
          ) : (
            <>
              <Pill variant="teal">● Active</Pill>
              <Button variant="ghost" size="sm" onClick={() => router.push('/snapshot')}>
                End my day →
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="px-8 pb-8">
        <WeeklyAnchorBanner />
        <StreakAtRisk today={today} />
        <GoalHero goal={today} />

        <div className="lg:hidden mb-4">
          <ShareCard streakCount={streaks.current} username={username} />
        </div>

        {/* Afternoon check-in nudge */}
        {!dayEnded && timePeriod === 'afternoon' && (
          <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-ink mb-0.5">Midday check-in</p>
              <p className="text-[11px] text-ink-4">Still on track? Take 10 seconds to confirm.</p>
            </div>
            <Link href="/checkin" className="text-[11px] text-gold hover:underline underline-offset-2 flex-shrink-0 ml-4">
              Check in →
            </Link>
          </div>
        )}

        {/* Evening ready-to-close prompt */}
        {!dayEnded && timePeriod === 'evening' && templateAllDone && (
          <div className="bg-[rgba(26,122,101,0.08)] border border-[rgba(26,122,101,0.3)] rounded-[12px] px-4 py-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-teal-bright mb-0.5">
                {today.templateType === 'focus' ? 'Both tasks done ✓'
                  : today.templateType === 'mit' ? 'All 3 tasks done ✓'
                  : today.templateType === 'timeblocks' ? 'All blocks done ✓'
                  : '3+ areas done ✓'}
              </p>
              <p className="text-[11px] text-ink-4">Ready to close the day and lock in the streak?</p>
            </div>
            <Button size="sm" onClick={() => router.push('/snapshot')} className="flex-shrink-0 ml-4">
              Close day →
            </Button>
          </div>
        )}

        {/* Focus */}
        {today.templateType === 'focus' && (
          <>
            <SectionTitle>Support tasks</SectionTitle>
            <TaskCard label="Task 1 · unblocks goal" text={today.task1Text} done={today.task1Done} onToggle={() => toggleTemplateItem(0)} disabled={dayEnded} />
            <TaskCard label="Task 2 · involves another person" text={today.task2Text} done={today.task2Done} onToggle={() => toggleTemplateItem(1)} disabled={dayEnded} />
          </>
        )}

        {/* MIT */}
        {today.templateType === 'mit' && (
          <>
            <SectionTitle>Most important tasks</SectionTitle>
            <TaskCard label="Task 1" text={today.task1Text} done={today.task1Done} onToggle={() => toggleTemplateItem(0)} disabled={dayEnded} />
            <TaskCard label="Task 2" text={today.task2Text} done={today.task2Done} onToggle={() => toggleTemplateItem(1)} disabled={dayEnded} />
            <TaskCard label="Task 3" text={today.task3Text} done={today.task3Done} onToggle={() => toggleTemplateItem(2)} disabled={dayEnded} />
          </>
        )}

        {/* Time Blocks */}
        {today.templateType === 'timeblocks' && (
          <>
            <SectionTitle>Time blocks</SectionTitle>
            <TaskCard label={today.block1Label} text={today.block1Intention} done={today.block1Done} onToggle={() => toggleTemplateItem(0)} disabled={dayEnded} />
            <TaskCard label={today.block2Label} text={today.block2Intention} done={today.block2Done} onToggle={() => toggleTemplateItem(1)} disabled={dayEnded} />
            <TaskCard label={today.block3Label} text={today.block3Intention} done={today.block3Done} onToggle={() => toggleTemplateItem(2)} disabled={dayEnded} />
          </>
        )}

        {/* Life Areas */}
        {today.templateType === 'lifeareas' && (() => {
          const doneCount = [today.workDone, today.homeDone, today.familyDone, today.healthDone, today.personalDone].filter(Boolean).length
          const areas = [
            { key: 'work',     intention: today.workIntention,     done: today.workDone,     idx: 0 },
            { key: 'home',     intention: today.homeIntention,     done: today.homeDone,     idx: 1 },
            { key: 'family',   intention: today.familyIntention,   done: today.familyDone,   idx: 2 },
            { key: 'health',   intention: today.healthIntention,   done: today.healthDone,   idx: 3 },
            { key: 'personal', intention: today.personalIntention, done: today.personalDone, idx: 4 },
          ] as const
          return (
            <>
              <SectionTitle>Life areas · {doneCount}/5 done · need 3</SectionTitle>
              {areas.map(({ key, intention, done, idx }) => (
                <TaskCard
                  key={key}
                  label={`${AREA_TAGS[key].icon} ${AREA_TAGS[key].label}`}
                  text={intention}
                  done={done}
                  onToggle={() => toggleTemplateItem(idx)}
                  disabled={dayEnded}
                />
              ))}
            </>
          )
        })()}

        {/* Day ended state */}
        {dayEnded && (
          <div className="mt-4 bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-4 text-center">
            <p className="text-[12px] text-ink-3 mb-3">
              Day closed · come back tomorrow for a fresh start
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button size="sm" onClick={() => router.push('/setup')}>
                Set up tomorrow →
              </Button>
              <Link href="/leaderboard" className="text-[12px] text-gold hover:underline underline-offset-2">
                View leaderboard
              </Link>
            </div>
          </div>
        )}

        <OverflowLog items={todayOverflow} onAdd={addOverflow} disabled={today.completed} />
      </div>

      {showComeback && (
        <ComebackBanner
          history={history}
          streaks={streaks}
          onDismiss={() => setShowComeback(false)}
        />
      )}
    </div>
  )
}
