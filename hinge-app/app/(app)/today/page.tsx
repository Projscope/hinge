'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import GoalHero from '@/components/today/GoalHero'
import TaskCard from '@/components/today/TaskCard'
import OverflowLog from '@/components/today/OverflowLog'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import SectionTitle from '@/components/ui/SectionTitle'

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
  const { today, todayOverflow, toggleTask, addOverflow, hydrated } = useAppStore()

  if (!hydrated) return null

  if (!today) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <p className="font-serif text-[28px] text-ink mb-3">No goal set yet.</p>
        <p className="text-ink-3 text-[14px] mb-6">Start your morning setup — it takes 60 seconds.</p>
        <Button onClick={() => router.push('/setup')}>Start morning setup →</Button>
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
          <Pill variant="teal">● Active</Pill>
          <Button variant="ghost" size="sm" onClick={() => router.push('/snapshot')}>
            End my day →
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Goal hero */}
        <GoalHero goal={today} />

        {/* Support tasks */}
        <SectionTitle>Support tasks</SectionTitle>
        <TaskCard
          label="Support task 1 · unblocks goal"
          text={today.task1Text}
          done={today.task1Done}
          onToggle={() => toggleTask(1)}
        />
        <TaskCard
          label="Support task 2 · involves another person"
          text={today.task2Text}
          done={today.task2Done}
          onToggle={() => toggleTask(2)}
        />

        {/* Overflow log */}
        <OverflowLog items={todayOverflow} onAdd={addOverflow} />
      </div>
    </div>
  )
}
