'use client'

import type { DailyGoal, Streaks, Plan } from '@/lib/types'
import WeekDots from './WeekDots'
import Heatmap from './Heatmap'
import ShareCard from '@/components/snapshot/ShareCard'

interface RightPanelProps {
  streaks: Streaks
  history: DailyGoal[]
  today: DailyGoal | null
  plan: Plan
  hitRate: number
}

function Divider() {
  return <div className="h-px bg-[var(--border)] my-3.5" />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.1em] text-ink-4 font-medium mb-2.5">
      {children}
    </p>
  )
}

export default function RightPanel({ streaks, history, today, plan, hitRate }: RightPanelProps) {

  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long' })

  const specificGoalHitRate = 91 // placeholder until real data
  const vagueGoalHitRate = 44   // placeholder

  return (
    <aside className="bg-bg-2 overflow-y-auto px-5 py-6 app-scroll h-full">

      {/* This week */}
      <SectionLabel>This week</SectionLabel>
      <WeekDots history={history} today={today} />

      <Divider />

      {/* Stats */}
      <SectionLabel>Stats</SectionLabel>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5">
          <p className="font-serif text-[22px] text-ink leading-none">{streaks.current}</p>
          <p className="text-[9px] text-ink-3 mt-0.5">Streak 🔥</p>
        </div>
        <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5">
          <p className="font-serif text-[22px] text-ink leading-none">{hitRate}%</p>
          <p className="text-[9px] text-ink-3 mt-0.5">Hit rate</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5">
          <p className="font-serif text-[22px] text-ink leading-none">
            {history.filter((g) => g.date.startsWith(now.toISOString().slice(0, 7))).length}
          </p>
          <p className="text-[9px] text-ink-3 mt-0.5">This month</p>
        </div>
        {/* Personal best — locked for free */}
        <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5 relative overflow-hidden">
          <p className={`font-serif text-[22px] text-ink leading-none ${plan === 'free' ? 'blur-[5px]' : ''}`}>
            {streaks.personalBest}
          </p>
          <p className="text-[9px] text-ink-3 mt-0.5">Personal best</p>
          {plan === 'free' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(14,13,11,0.75)] rounded-[10px]">
              <span className="text-[10px] font-medium text-gold">🔒 Pro</span>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Goal quality mini */}
      <SectionLabel>Goal quality</SectionLabel>
      <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5">
        {[
          { label: 'Specific', pct: specificGoalHitRate, color: 'bg-teal-bright', textColor: 'text-teal-bright' },
          { label: 'Vague', pct: vagueGoalHitRate, color: 'bg-[rgba(192,57,43,0.7)]', textColor: 'text-[#e26b5e]' },
        ].map(({ label, pct, color, textColor }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <span className="text-[10px] text-ink-3 min-w-[56px]">{label}</span>
            <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-[11px] font-medium min-w-[28px] text-right ${textColor}`}>{pct}%</span>
          </div>
        ))}
        <p className="text-[10px] text-ink-3 mt-2 pt-2 border-t border-[var(--border)] leading-snug">
          Specific goals hit <strong className="text-ink">2×</strong> more often.
        </p>
      </div>

      <Divider />

      {/* Heatmap */}
      <SectionLabel>{monthName}</SectionLabel>
      <Heatmap history={history} today={today} />
      <p className="text-[10px] text-ink-4 mt-1.5">One miss in a sea of gold.</p>

      <Divider />

      {/* Share card */}
      {streaks.current >= 1 && (
        <>
          <SectionLabel>Day {streaks.current} milestone</SectionLabel>
          <ShareCard
            streakCount={streaks.current}
          />
        </>
      )}

    </aside>
  )
}
