'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import GoalHero from '@/components/today/GoalHero'
import TaskCard from '@/components/today/TaskCard'
import OverflowLog from '@/components/today/OverflowLog'
import { AREA_TAGS, type MITTasks, type TimeBlockTasks, type LifeAreaTasks } from '@/lib/types'
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
  const { today, todayOverflow, toggleTask, toggleTemplateItem, addOverflow, hydrated, history, streaks, username, dayEnded } = useAppStore()
  const [showComeback, setShowComeback] = useState(true)

  const timePeriod = useMemo(() => getTimePeriod(), [])
  const bothTasksDone = today?.task1Done && today?.task2Done

  // For non-focus templates, compute done state for evening CTA
  const templateAllDone = (() => {
    if (!today) return false
    if (today.templateType === 'focus') return !!(today.task1Done && today.task2Done)
    if (today.templateType === 'mit') return !!(today.tasks as MITTasks | undefined)?.tasks.every((t) => t.done)
    if (today.templateType === 'timeblocks') return !!(today.tasks as TimeBlockTasks | undefined)?.blocks.every((b) => b.done)
    if (today.templateType === 'lifeareas') return ((today.tasks as LifeAreaTasks | undefined)?.areas.filter((a) => a.done).length ?? 0) >= 3
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

        {/* Time-aware heading */}
        <div className="mb-8">
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-gold mb-2">
            {formatDate(now)}
          </p>
          <h1 className="font-serif text-[32px] text-ink leading-tight mb-2">
            {copy.heading}
          </h1>
          <p className="text-[14px] text-ink-3 leading-relaxed">{copy.sub}</p>
        </div>

        {/* Setup CTA */}
        <Button onClick={() => router.push('/setup')} className="w-full mb-8">
          Start morning setup →
        </Button>

        {/* Streak context */}
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

        {/* Queue nudge */}
        <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink mb-0.5">Goal queue</p>
            <p className="text-[11px] text-ink-4">Pre-load goals so setup takes one tap.</p>
          </div>
          <Link href="/queue" className="text-[11px] text-gold hover:underline underline-offset-2 flex-shrink-0 ml-4">
            Open queue →
          </Link>
        </div>

        {/* Heatmap — mobile only (right panel handles desktop) */}
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
      {/* Page header */}
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
        {/* Weekly anchor */}
        <WeeklyAnchorBanner />

        {/* Streak at risk banner */}
        <StreakAtRisk today={today} />

        {/* Goal hero */}
        <GoalHero goal={today} />

        {/* Share streak — mobile only */}
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
              <p className="text-[12px] font-medium text-teal-bright mb-0.5">Both tasks done ✓</p>
              <p className="text-[11px] text-ink-4">Ready to close the day and lock in the streak?</p>
            </div>
            <Button size="sm" onClick={() => router.push('/snapshot')} className="flex-shrink-0 ml-4">
              Close day →
            </Button>
          </div>
        )}

        {/* Template-aware task rendering */}
        {today.templateType === 'focus' && (
          <>
            <SectionTitle>Support tasks</SectionTitle>
            <TaskCard label="Task 1 · unblocks goal" text={today.task1Text} done={today.task1Done} onToggle={() => toggleTask(1)} disabled={dayEnded} />
            <TaskCard label="Task 2 · involves another person" text={today.task2Text} done={today.task2Done} onToggle={() => toggleTask(2)} disabled={dayEnded} />
          </>
        )}

        {today.templateType === 'mit' && (() => {
          const mit = today.tasks as MITTasks | undefined
          if (!mit) return null
          return (
            <>
              <SectionTitle>Most important tasks</SectionTitle>
              {mit.tasks.map((t, i) => (
                <TaskCard key={i} label={`Task ${i + 1}`} text={t.text} done={t.done} onToggle={() => toggleTemplateItem(i)} disabled={dayEnded} />
              ))}
            </>
          )
        })()}

        {today.templateType === 'timeblocks' && (() => {
          const tb = today.tasks as TimeBlockTasks | undefined
          if (!tb) return null
          return (
            <>
              <SectionTitle>Time blocks</SectionTitle>
              {tb.blocks.map((b, i) => (
                <TaskCard key={i} label={b.label} text={b.intention} done={b.done} onToggle={() => toggleTemplateItem(i)} disabled={dayEnded} />
              ))}
            </>
          )
        })()}

        {today.templateType === 'lifeareas' && (() => {
          const la = today.tasks as LifeAreaTasks | undefined
          if (!la) return null
          const doneCount = la.areas.filter((a) => a.done).length
          return (
            <>
              <SectionTitle>Life areas · {doneCount}/5 done · need 3</SectionTitle>
              {la.areas.map((a, i) => (
                <TaskCard
                  key={a.tag}
                  label={`${AREA_TAGS[a.tag].icon} ${AREA_TAGS[a.tag].label}`}
                  text={a.intention}
                  done={a.done}
                  onToggle={() => toggleTemplateItem(i)}
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

        {/* Overflow log */}
        <OverflowLog items={todayOverflow} onAdd={addOverflow} disabled={today.completed} />
      </div>

      {/* Comeback banner */}
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
