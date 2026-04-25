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
import { isGoalReadyToClose, TEMPLATES, AREA_TAGS, type MITTasks, type TimeBlockTasks, type LifeAreaTasks } from '@/lib/types'

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

  // Build a readable task recap based on template
  function TaskRecap() {
    if (today!.templateType === 'focus') {
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          <p className={`text-[13px] flex items-center gap-2 ${today!.task1Done ? 'text-teal-bright' : 'text-ink-3'}`}>
            {today!.task1Done ? '✓' : '○'} {today!.task1Text}
          </p>
          <p className={`text-[13px] flex items-center gap-2 ${today!.task2Done ? 'text-teal-bright' : 'text-ink-3'}`}>
            {today!.task2Done ? '✓' : '○'} {today!.task2Text}
          </p>
        </div>
      )
    }

    if (today!.templateType === 'mit') {
      const mit = today!.tasks as MITTasks | undefined
      if (!mit) return null
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {mit.tasks.map((t, i) => (
            <p key={i} className={`text-[13px] flex items-center gap-2 ${t.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {t.done ? '✓' : '○'} {t.text}
            </p>
          ))}
        </div>
      )
    }

    if (today!.templateType === 'timeblocks') {
      const tb = today!.tasks as TimeBlockTasks | undefined
      if (!tb) return null
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {tb.blocks.map((b, i) => (
            <p key={i} className={`text-[13px] flex items-center gap-2 ${b.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {b.done ? '✓' : '○'} <span className="text-ink-4 font-medium">{b.label}:</span> {b.intention}
            </p>
          ))}
        </div>
      )
    }

    if (today!.templateType === 'lifeareas') {
      const la = today!.tasks as LifeAreaTasks | undefined
      if (!la) return null
      const doneCount = la.areas.filter((a) => a.done).length
      return (
        <div className="border-t border-[var(--border)] pt-2.5 flex flex-col gap-1.5">
          {la.areas.map((a) => (
            <p key={a.tag} className={`text-[13px] flex items-center gap-2 ${a.done ? 'text-teal-bright' : 'text-ink-3'}`}>
              {a.done ? '✓' : '○'} {AREA_TAGS[a.tag].icon} {AREA_TAGS[a.tag].label}: {a.intention || '—'}
            </p>
          ))}
          <p className="text-[11px] text-ink-4 pt-1">
            {doneCount}/5 areas done · {doneCount >= 3 ? 'threshold met ✓' : `need ${3 - doneCount} more`}
          </p>
        </div>
      )
    }

    return null
  }

  // Not-ready message per template
  function notReadyMessage() {
    if (today!.templateType === 'focus') return 'Both support tasks must be completed before you can mark the goal as achieved.'
    if (today!.templateType === 'mit') return 'All 3 tasks must be completed to mark this day as a win.'
    if (today!.templateType === 'timeblocks') return 'All 3 time blocks must be marked done before closing the day.'
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
            {today.dayIntention || today.mainGoal || '—'}
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
