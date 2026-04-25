'use client'

import type { DailyGoal } from '@/lib/types'
import { templateProgress, TEMPLATES, getGoalHeadline } from '@/lib/types'

interface GoalHeroProps {
  goal: DailyGoal
}

function timeRemaining(endTime: string): string {
  const now = new Date()
  const [h, m] = endTime.split(':').map(Number)
  const end = new Date(now)
  end.setHours(h, m, 0, 0)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return 'Day ended'
  const hours = Math.floor(diff / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  return hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`
}

export default function GoalHero({ goal }: GoalHeroProps) {
  const pct = templateProgress(goal)
  const remaining = timeRemaining(goal.endTime)
  const templateLabel = TEMPLATES.find((t) => t.type === goal.templateType)?.label ?? 'Focus Mode'

  const headline = getGoalHeadline(goal) || null

  return (
    <div className="relative bg-bg-3 border border-[var(--border2)] rounded-[16px] px-7 py-6 mb-5 overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.08),transparent_70%)] pointer-events-none" />

      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-[9px] uppercase tracking-[0.12em] text-gold font-semibold">
          {templateLabel}
        </p>
        {goal.templateType === 'focus' && goal.areaTag && (
          <span className="text-[9px] uppercase tracking-[0.1em] text-ink-4 font-medium">· {goal.areaTag}</span>
        )}
      </div>

      {headline ? (
        <p className="font-serif text-[22px] text-ink leading-[1.3] mb-4 relative z-10">
          {headline}
        </p>
      ) : (
        <p className="font-serif text-[18px] text-ink-3 leading-[1.3] mb-4 relative z-10 italic">
          No theme set
        </p>
      )}

      <div className="flex items-center gap-3.5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 bg-[rgba(200,146,42,0.12)] text-gold text-[11px] font-medium px-[11px] py-1 rounded-full border border-[rgba(200,146,42,0.18)]">
          ⏱ {remaining}
        </span>
        <div className="flex items-center gap-2.5 flex-1 min-w-[160px]">
          <div className="flex-1 h-[3px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-medium text-gold whitespace-nowrap">{pct}%</span>
        </div>
        <span className="text-[11px] text-ink-3">ends {goal.endTime}</span>
      </div>
    </div>
  )
}
