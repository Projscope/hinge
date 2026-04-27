'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import ShareCard from '@/components/snapshot/ShareCard'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'
import AchievementOverlay from '@/components/overlays/AchievementOverlay'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { getPublicProfile } from '@/lib/publicProfile'
import { isGoalReadyToClose, TEMPLATES, AREA_TAGS, getGoalHeadline } from '@/lib/types'

export default function SnapshotPage() {
  const router = useRouter()
  const { today, streaks, history, endDay, hydrated, dayEnded } = useAppStore()
  const [toast, setToast] = useState<string | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const dismiss = useCallback(() => setToast(null), [])

  useEffect(() => {
    getPublicProfile().then((p) => { if (p) setUsername(p.username) })
  }, [])

  if (!hydrated) return null

  if (!today) {
    router.replace('/today')
    return null
  }

  const readyToClose = isGoalReadyToClose(today)
  const alreadyEnded = dayEnded
  const templateLabel = TEMPLATES.find((t) => t.type === today.templateType)?.label ?? 'Focus Mode'

  function handleEnd(completed: boolean) {
    endDay(completed)
    if (completed) {
      setShowAchievement(true)
    } else {
      router.push('/today')
    }
  }

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function TaskRecap() {
    const t = today!
    if (t.templateType === 'focus') {
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          <p className={`text-[13px] flex items-center gap-2 ${t.task1Done ? 'text-teal-bright' : 'text-ink-3'}`}>
            {t.task1Done ? '✓' : '○'} {t.task1Text}
          </p>
          <p className={`text-[13px] flex items-center gap-2 ${t.task2Done ? 'text-teal-bright' : 'text-ink-3'}`}>
            {t.task2Done ? '✓' : '○'} {t.task2Text}
          </p>
        </div>
      )
    }
    if (t.templateType === 'mit') {
      const filledTasks = [
        { text: t.task1Text, done: t.task1Done },
        { text: t.task2Text, done: t.task2Done },
        { text: t.task3Text, done: t.task3Done },
      ].filter((item) => item.text.trim().length > 0)
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {filledTasks.map((item, i) => (
            <p key={i} className={`text-[13px] flex items-center gap-2 ${item.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {item.done ? '✓' : '○'} {item.text}
            </p>
          ))}
        </div>
      )
    }
    if (t.templateType === 'timeblocks') {
      const filledBlocks = [
        { label: t.block1Label, intention: t.block1Intention, done: t.block1Done },
        { label: t.block2Label, intention: t.block2Intention, done: t.block2Done },
        { label: t.block3Label, intention: t.block3Intention, done: t.block3Done },
      ].filter((b) => b.intention.trim().length > 0)
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {filledBlocks.map((b, i) => (
            <p key={i} className={`text-[13px] flex items-center gap-2 ${b.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {b.done ? '✓' : '○'} <span className="text-ink-4 font-medium">{b.label}:</span> {b.intention}
            </p>
          ))}
        </div>
      )
    }
    if (t.templateType === 'lifeareas') {
      const areas = [
        { key: 'work'     as const, intention: t.workIntention,     done: t.workDone },
        { key: 'home'     as const, intention: t.homeIntention,     done: t.homeDone },
        { key: 'family'   as const, intention: t.familyIntention,   done: t.familyDone },
        { key: 'health'   as const, intention: t.healthIntention,   done: t.healthDone },
        { key: 'personal' as const, intention: t.personalIntention, done: t.personalDone },
      ].filter((a) => a.intention.trim().length > 0)
      const doneCount = areas.filter((a) => a.done).length
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {areas.map((a) => (
            <p key={a.key} className={`text-[13px] flex items-center gap-2 ${a.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {a.done ? '✓' : '○'} {AREA_TAGS[a.key].icon} {AREA_TAGS[a.key].label}: {a.intention}
            </p>
          ))}
          <p className="text-[11px] text-ink-4 pt-1">
            {doneCount}/{areas.length} areas done · {doneCount >= 3 ? 'threshold met ✓' : `need ${3 - doneCount} more`}
          </p>
        </div>
      )
    }
    return null
  }

  // Not-ready message per template
  function notReadyMessage() {
    if (today!.templateType === 'focus') return 'Both support tasks must be completed before you can mark the goal as achieved.'
    if (today!.templateType === 'mit') {
      const n = [today!.task1Text, today!.task2Text, today!.task3Text].filter((t) => t.trim().length > 0).length
      return `All ${n} task${n === 1 ? '' : 's'} must be completed to mark this day as a win.`
    }
    if (today!.templateType === 'timeblocks') {
      const n = [today!.block1Intention, today!.block2Intention, today!.block3Intention].filter((b) => b.trim().length > 0).length
      return `All ${n} time block${n === 1 ? '' : 's'} must be marked done before closing the day.`
    }
    if (today!.templateType === 'lifeareas') return 'At least 3 of 5 life areas must be done to mark this day as a win.'
    return ''
  }

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">End-of-day snapshot</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">{dateLabel}</p>
        </div>
        <Pill variant={readyToClose ? 'teal' : 'neutral'}>
          {readyToClose ? 'Ready to close' : templateLabel}
        </Pill>
      </div>

      <div className="px-8 pb-8 max-w-[560px]">
        {/* Verdict */}
        {alreadyEnded ? (
          <div className="text-center py-7 mb-5">
            <p className="text-[42px] mb-2.5">{today.completed ? '🎯' : '😔'}</p>
            <p className="font-serif text-[28px] text-ink mb-1">
              {today.completed ? 'Goal achieved' : 'Missed today'}
            </p>
            <p className="text-[13px] text-ink-3">
              {today.completed
                ? "You nailed today's focus · streak continues"
                : 'Fresh start — today still counts'}
            </p>
          </div>
        ) : (
          <div className="text-center py-7 mb-5">
            <p className="text-[42px] mb-2.5">
              {readyToClose ? '🎯' : '⏳'}
            </p>
            <p className="font-serif text-[24px] text-ink mb-4">
              Did you hit your goal today?
            </p>
            {!readyToClose && (
              <p className="text-[12px] text-[rgba(192,57,43,0.9)] bg-[var(--danger-dim)] border border-[rgba(192,57,43,0.2)] rounded-[10px] px-4 py-2.5 mb-4 leading-relaxed">
                {notReadyMessage()}
              </p>
            )}
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => handleEnd(true)}
                disabled={!readyToClose}
                className={!readyToClose ? 'opacity-30 cursor-not-allowed' : ''}
              >
                Yes — goal achieved ✓
              </Button>
              <Button variant="ghost" onClick={() => handleEnd(false)}>
                No — missed today
              </Button>
            </div>
          </div>
        )}

        {/* Goal recap */}
        <Card className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">{templateLabel}</p>
          <p className="font-serif text-[17px] text-ink mb-3">
            {getGoalHeadline(today) || '—'}
          </p>
          <TaskRecap />
        </Card>

        {/* Streak share card */}
        <ShareCard streakCount={streaks.current} username={username} achieved={today.completed} />

        <p className="text-center text-[12px] text-ink-3 leading-[1.8] mt-5">
          Resets at midnight · Tomorrow is a blank slate<br />
          <span className="text-[11px] text-ink-4">Set your goal in the morning — not tonight.</span>
        </p>

        <p className="text-center text-[12px] text-ink-3 mt-4">
          See how you stack up →{' '}
          <Link href="/leaderboard" className="text-gold underline-offset-2 hover:underline">View leaderboard</Link>
        </p>
      </div>

      {toast && <Toast message={toast} onDone={dismiss} />}

      {showAchievement && (
        <AchievementOverlay
          streakCount={streaks.current}
          personalBest={streaks.personalBest}
          history={history}
          goal={today}
          onDone={() => router.push('/today')}
        />
      )}
    </div>
  )
}
