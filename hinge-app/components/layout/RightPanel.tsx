'use client'

import type { DailyGoal, Streaks, Plan } from '@/lib/types'
import { getGoalHeadline } from '@/lib/types'
import WeekDots from './WeekDots'
import Heatmap from './Heatmap'
import ShareCard from '@/components/snapshot/ShareCard'
import { scoreGoalQuality } from '@/lib/goalQuality'

interface RightPanelProps {
  streaks: Streaks
  history: DailyGoal[]
  today: DailyGoal | null
  plan: Plan
  hitRate: number
  username?: string | null
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

export default function RightPanel({ streaks, history, today, plan, hitRate, username }: RightPanelProps) {

  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long' })

  // Compute real goal quality hit rates from history
  const goalQualityStats = (() => {
    if (history.length < 3) return null
    const scored = history
      .filter((g) => getGoalHeadline(g).trim())
      .map((g) => ({ score: scoreGoalQuality(getGoalHeadline(g)).score, completed: g.completed }))
    const specific = scored.filter((g) => g.score >= 70)
    const vague = scored.filter((g) => g.score < 35)
    if (specific.length === 0 || vague.length === 0) return null
    const specificHitRate = Math.round((specific.filter((g) => g.completed).length / specific.length) * 100)
    const vagueHitRate = Math.round((vague.filter((g) => g.completed).length / vague.length) * 100)
    const multiplier = vagueHitRate > 0 ? (specificHitRate / vagueHitRate).toFixed(1) : null
    return { specificHitRate, vagueHitRate, multiplier }
  })()

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
      {goalQualityStats ? (
        <div className="bg-bg-3 border border-[var(--border)] rounded-[10px] px-3 py-2.5">
          {[
            { label: 'Specific', pct: goalQualityStats.specificHitRate, color: 'bg-teal-bright', textColor: 'text-teal-bright' },
            { label: 'Vague', pct: goalQualityStats.vagueHitRate, color: 'bg-[rgba(192,57,43,0.7)]', textColor: 'text-[#e26b5e]' },
          ].map(({ label, pct, color, textColor }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <span className="text-[10px] text-ink-3 min-w-[56px]">{label}</span>
              <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[11px] font-medium min-w-[28px] text-right ${textColor}`}>{pct}%</span>
            </div>
          ))}
          {goalQualityStats.multiplier && (
            <p className="text-[10px] text-ink-3 mt-2 pt-2 border-t border-[var(--border)] leading-snug">
              Specific goals hit <strong className="text-ink">{goalQualityStats.multiplier}×</strong> more often.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-ink-4 leading-snug">
          Appears after your first 3 days.
        </p>
      )}

      <Divider />

      {/* Heatmap */}
      <SectionLabel>{monthName}</SectionLabel>
      <Heatmap history={history} today={today} />
      <p className="text-[10px] text-ink-4 mt-1.5">🟢 achieved &nbsp;🔴 missed</p>

      <Divider />

      {/* Share card */}
      {streaks.current >= 1 && (
        <>
          <SectionLabel>Day {streaks.current} milestone</SectionLabel>
          <ShareCard
            streakCount={streaks.current}
            username={username}
          />
        </>
      )}

    </aside>
  )
}
