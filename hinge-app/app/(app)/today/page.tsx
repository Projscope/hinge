'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import OverflowLog from '@/components/today/OverflowLog'
import { AREA_TAGS, templateProgress, isGoalReadyToClose, type DailyGoal } from '@/lib/types'
import StreakAtRisk from '@/components/today/StreakAtRisk'
import WeeklyAnchorBanner from '@/components/today/WeeklyAnchorBanner'
import ComebackBanner from '@/components/overlays/ComebackBanner'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import Heatmap from '@/components/layout/Heatmap'
import WeekDots from '@/components/layout/WeekDots'
import ShareCard from '@/components/snapshot/ShareCard'
import { scoreGoalQuality } from '@/lib/goalQuality'

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
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`
}

const NO_GOAL_COPY: Record<TimePeriod, { heading: string; sub: string }> = {
  morning: {
    heading: 'What makes today a win?',
    sub: '60 seconds of focus now saves hours of drift later.',
  },
  afternoon: {
    heading: "There's still time.",
    sub: "Set your focus for the rest of the day — it still counts.",
  },
  evening: {
    heading: 'Late start is better than no start.',
    sub: 'Even an hour of focused effort builds the habit.',
  },
}

function getNowLabel(today: DailyGoal, timePeriod: TimePeriod): string {
  if (today.templateType === 'focus') return 'YOUR FOCUS TODAY'
  if (today.templateType === 'mit') return 'MOST IMPORTANT TASKS'
  if (today.templateType === 'lifeareas') return "TODAY'S AREAS"
  if (today.templateType === 'timeblocks') {
    const label =
      timePeriod === 'morning'
        ? today.block1Label
        : timePeriod === 'afternoon'
        ? today.block2Label
        : today.block3Label
    return `NOW · ${label.toUpperCase()}`
  }
  return 'TODAY'
}

function getNowHeadline(today: DailyGoal, timePeriod: TimePeriod): string {
  if (today.templateType === 'focus') {
    return today.dayIntention?.trim() || today.mainGoal || '—'
  }
  if (today.templateType === 'mit') {
    return today.dayIntention?.trim() || today.task1Text || '—'
  }
  if (today.templateType === 'timeblocks') {
    return timePeriod === 'morning'
      ? today.block1Intention
      : timePeriod === 'afternoon'
      ? today.block2Intention
      : today.block3Intention
  }
  if (today.templateType === 'lifeareas') {
    return today.dayIntention?.trim() || 'Balance across areas'
  }
  return '—'
}

function getNowSubtitle(today: DailyGoal): string | null {
  if (today.templateType === 'focus' && today.task1Text.trim()) {
    return today.task1Text
  }
  return null
}

function qualityBadge(text: string): 'Specific' | 'Vague' | null {
  if (!text || text.trim().length < 4) return null
  const score = scoreGoalQuality(text).score
  if (score >= 70) return 'Specific'
  if (score < 35) return 'Vague'
  return null
}

type UpNextItem = {
  idx: number
  label: string
  text: string
  done: boolean
  badge: 'Specific' | 'Vague' | null
}

function getUpNextItems(today: DailyGoal, timePeriod: TimePeriod): UpNextItem[] {
  if (today.templateType === 'focus') {
    return [
      { idx: 0, label: 'TASK 1 · UNBLOCKS GOAL', text: today.task1Text, done: today.task1Done, badge: qualityBadge(today.task1Text) },
      { idx: 1, label: 'TASK 2 · COLLAB', text: today.task2Text, done: today.task2Done, badge: qualityBadge(today.task2Text) },
    ].filter((i) => i.text.trim())
  }
  if (today.templateType === 'mit') {
    return [
      { idx: 0, label: 'TASK 1', text: today.task1Text, done: today.task1Done, badge: qualityBadge(today.task1Text) },
      { idx: 1, label: 'TASK 2', text: today.task2Text, done: today.task2Done, badge: qualityBadge(today.task2Text) },
      { idx: 2, label: 'TASK 3', text: today.task3Text, done: today.task3Done, badge: qualityBadge(today.task3Text) },
    ].filter((i) => i.text.trim())
  }
  if (today.templateType === 'timeblocks') {
    return [
      { idx: 0, label: today.block1Label.toUpperCase(), text: today.block1Intention, done: today.block1Done, badge: null },
      { idx: 1, label: today.block2Label.toUpperCase(), text: today.block2Intention, done: today.block2Done, badge: null },
      { idx: 2, label: today.block3Label.toUpperCase(), text: today.block3Intention, done: today.block3Done, badge: null },
    ].filter((i) => i.text.trim())
  }
  if (today.templateType === 'lifeareas') {
    const doneCount = [today.workDone, today.homeDone, today.familyDone, today.healthDone, today.personalDone].filter(Boolean).length
    return [
      { idx: 0, label: `${AREA_TAGS.work.icon} WORK`,     text: today.workIntention,     done: today.workDone,     badge: null },
      { idx: 1, label: `${AREA_TAGS.home.icon} HOME`,     text: today.homeIntention,     done: today.homeDone,     badge: null },
      { idx: 2, label: `${AREA_TAGS.family.icon} FAMILY`, text: today.familyIntention,   done: today.familyDone,   badge: null },
      { idx: 3, label: `${AREA_TAGS.health.icon} HEALTH`, text: today.healthIntention,   done: today.healthDone,   badge: null },
      { idx: 4, label: `${AREA_TAGS.personal.icon} PERSONAL`, text: today.personalIntention, done: today.personalDone, badge: null },
    ].filter((i) => i.text.trim()).map((i) => ({
      ...i,
      label: doneCount < 3 ? i.label : i.label,
    }))
  }
  return []
}

// ── Up-next card ───────────────────────────────────────────────────────────────

function UpNextCard({
  label, text, done, badge, onToggle, disabled,
}: {
  label: string; text: string; done: boolean
  badge: 'Specific' | 'Vague' | null
  onToggle: () => void; disabled: boolean
}) {
  return (
    <div
      className={`border rounded-[12px] px-4 py-3.5 flex gap-3 items-start transition-colors ${
        done
          ? 'bg-[rgba(26,122,101,0.06)] border-[rgba(26,122,101,0.2)]'
          : 'bg-bg-3 border-[var(--border)]'
      }`}
    >
      <button
        onClick={!disabled ? onToggle : undefined}
        disabled={disabled}
        className="mt-0.5 flex-shrink-0 focus:outline-none"
        aria-label={done ? 'Mark undone' : 'Mark done'}
      >
        <div
          className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
            done ? 'border-[#2ab87e] bg-[#2ab87e]' : 'border-[rgba(255,255,255,0.25)]'
          }`}
        >
          {done && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-ink-4 mb-0.5">{label}</p>
        <p className={`text-[13px] leading-snug ${done ? 'text-ink-3 line-through decoration-[rgba(255,255,255,0.2)]' : 'text-ink'}`}>
          {text}
        </p>
      </div>
      {badge && (
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 self-start mt-1 border ${
            badge === 'Specific'
              ? 'bg-[rgba(42,184,126,0.1)] text-teal-bright border-[rgba(42,184,126,0.2)]'
              : 'bg-[rgba(192,57,43,0.1)] text-[#e26b5e] border-[rgba(192,57,43,0.2)]'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter()
  const { today, todayOverflow, toggleTemplateItem, addOverflow, hydrated, history, streaks, username, dayEnded } = useAppStore()
  const [showComeback, setShowComeback] = useState(true)
  const timePeriod = useMemo(() => getTimePeriod(), [])

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
  const pct = templateProgress(today)
  const readyToClose = isGoalReadyToClose(today)
  const nowLabel = getNowLabel(today, timePeriod)
  const nowHeadline = getNowHeadline(today, timePeriod)
  const nowSubtitle = getNowSubtitle(today)
  const upNextItems = getUpNextItems(today, timePeriod)

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="px-8 pt-7 pb-0 flex items-start justify-between mb-5">
        <div>
          <h1 className="font-serif text-[32px] text-ink leading-tight">Today</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {formatDate(new Date())} ·{' '}
            <span className="text-gold">{timeLeft(today.endTime)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {dayEnded ? (
            <Pill variant={today.completed ? 'teal' : 'neutral'}>
              {today.completed ? '✓ Completed' : '✗ Missed'}
            </Pill>
          ) : (
            <>
              <Pill variant="teal">● In a block</Pill>
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

        {/* ── NOW section ──────────────────────────────────────────────────── */}
        <div className="relative bg-bg-3 border border-[var(--border2)] rounded-[16px] px-7 py-6 mb-5 overflow-hidden">
          {/* Radial glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.08),transparent_70%)] pointer-events-none" />

          {/* Label */}
          <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gold mb-4">
            {nowLabel}
          </p>

          {/* Big headline */}
          <h2 className="font-serif text-[44px] sm:text-[52px] leading-[1.1] text-ink mb-2 relative z-10">
            {nowHeadline}
          </h2>

          {/* Subtitle */}
          {nowSubtitle && (
            <p className="text-[14px] text-ink-3 leading-relaxed mt-3">
              {nowSubtitle}
            </p>
          )}

          {/* Progress row */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--border)]">
            <div className="flex-1 h-[3px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? '#2ab87e' : '#c8922a',
                }}
              />
            </div>
            <span className={`text-[11px] font-semibold tabular-nums ${pct === 100 ? 'text-teal-bright' : 'text-gold'}`}>
              {pct}%
            </span>
            <span className="text-[11px] text-ink-3 tabular-nums">
              ends {today.endTime}
            </span>
          </div>
        </div>

        {/* Mobile share card */}
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
        {!dayEnded && timePeriod === 'evening' && readyToClose && (
          <div className="bg-[rgba(26,122,101,0.08)] border border-[rgba(26,122,101,0.3)] rounded-[12px] px-4 py-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-teal-bright mb-0.5">All done ✓</p>
              <p className="text-[11px] text-ink-4">Ready to close the day and lock in the streak?</p>
            </div>
            <Button size="sm" onClick={() => router.push('/snapshot')} className="flex-shrink-0 ml-4">
              Close day →
            </Button>
          </div>
        )}

        {/* ── UP NEXT ──────────────────────────────────────────────────────── */}
        {upNextItems.length > 0 && (
          <div className="mb-5">
            <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-ink-4 mb-3">
              UP NEXT — TODAY
            </p>
            <div className={`grid gap-2.5 ${upNextItems.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {upNextItems.map((item) => (
                <UpNextCard
                  key={item.idx}
                  label={item.label}
                  text={item.text}
                  done={item.done}
                  badge={item.badge}
                  onToggle={() => toggleTemplateItem(item.idx)}
                  disabled={dayEnded}
                />
              ))}
            </div>
          </div>
        )}

        {/* Life areas progress note */}
        {today.templateType === 'lifeareas' && (() => {
          const doneCount = [today.workDone, today.homeDone, today.familyDone, today.healthDone, today.personalDone].filter(Boolean).length
          return (
            <p className="text-[11px] text-ink-4 mb-4">
              {doneCount}/5 areas done · {doneCount >= 3 ? 'threshold met ✓' : `need ${3 - doneCount} more to win the day`}
            </p>
          )
        })()}

        {/* Day ended state */}
        {dayEnded && (
          <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-4 text-center">
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
