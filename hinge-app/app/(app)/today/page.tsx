'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import GoalHero from '@/components/today/GoalHero'
import TaskCard from '@/components/today/TaskCard'
import OverflowLog from '@/components/today/OverflowLog'
import StreakAtRisk from '@/components/today/StreakAtRisk'
import WeeklyAnchorBanner from '@/components/today/WeeklyAnchorBanner'
import ComebackBanner from '@/components/overlays/ComebackBanner'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import SectionTitle from '@/components/ui/SectionTitle'
import Heatmap from '@/components/layout/Heatmap'
import WeekDots from '@/components/layout/WeekDots'

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
  return `${hours} hours ${mins} minutes left`
}

export default function TodayPage() {
  const router = useRouter()
  const { today, todayOverflow, toggleTask, addOverflow, hydrated, history, streaks } = useAppStore()
  const [showComeback, setShowComeback] = useState(true)

  if (!hydrated) return null

  if (!today) {
    const now = new Date()
    const monthName = now.toLocaleDateString('en-US', { month: 'long' })
    return (
      <div className="px-8 py-10">
        {/* CTA */}
        <div className="text-center mb-10">
          <p className="font-serif text-[28px] text-ink mb-3">No goal set yet.</p>
          <p className="text-ink-3 text-[14px] mb-6">Start your morning setup — it takes 60 seconds.</p>
          <Button onClick={() => router.push('/setup')}>Start morning setup →</Button>
        </div>

        {/* Heatmap — visible here on mobile since right panel is desktop-only */}
        <div className="lg:hidden">
          <div className="mb-4">
            <WeekDots history={history} today={null} />
          </div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-ink-4 font-medium mb-2.5">
            {monthName}
          </p>
          <Heatmap history={history} today={null} />
          <p className="text-[10px] text-ink-4 mt-1.5">One miss in a sea of gold.</p>
        </div>
      </div>
    )
  }

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
          {today.completed ? (
            <Pill variant={today.completed ? 'teal' : 'neutral'}>
              {today.completed ? '✓ Completed' : '● Active'}
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

        {/* Support tasks */}
        <SectionTitle>Support tasks</SectionTitle>
        <TaskCard
          label="Support task 1 · unblocks goal"
          text={today.task1Text}
          done={today.task1Done}
          onToggle={() => toggleTask(1)}
          disabled={today.completed}
        />
        <TaskCard
          label="Support task 2 · involves another person"
          text={today.task2Text}
          done={today.task2Done}
          onToggle={() => toggleTask(2)}
          disabled={today.completed}
        />

        {today.completed && (
          <p className="text-[12px] text-ink-3 text-center mt-1 mb-2">
            Day closed · come back tomorrow for a fresh start
          </p>
        )}

        {today.completed && (
          <p className="text-center text-[12px] text-ink-3 mt-3">
            See how you stack up →{' '}
            <Link href="/leaderboard" className="text-gold underline-offset-2 hover:underline">
              View leaderboard
            </Link>
          </p>
        )}

        {/* Overflow log */}
        <OverflowLog items={todayOverflow} onAdd={addOverflow} disabled={today.completed} />
      </div>

      {/* Comeback banner — shown when returning after a streak break */}
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
