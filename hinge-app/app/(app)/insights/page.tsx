'use client'

import { useAppStore } from '@/lib/store'
import Pill from '@/components/ui/Pill'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import { FOCUS_RANKS } from '@/lib/types'

const DAY_BARS = [
  { label: 'M', pct: 72, color: 'bg-gold opacity-60' },
  { label: 'T', pct: 55, color: 'bg-[rgba(200,146,42,0.4)]' },
  { label: 'W', pct: 89, color: 'bg-teal-bright opacity-70' },
  { label: 'T', pct: 91, color: 'bg-teal-bright' },
  { label: 'F', pct: 40, color: 'bg-[rgba(192,57,43,0.6)]' },
  { label: 'S', pct: 20, color: 'bg-[rgba(255,255,255,0.1)]' },
  { label: 'S', pct: 15, color: 'bg-[rgba(255,255,255,0.1)]' },
]

function calcHitRate(history: { completed: boolean }[]): number {
  if (history.length === 0) return 0
  return Math.round((history.filter((g) => g.completed).length / history.length) * 100)
}

export default function InsightsPage() {
  const { history, plan, hydrated } = useAppStore()

  if (!hydrated) return null

  const hitRate = calcHitRate(history.slice(0, 30))
  const rank = FOCUS_RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
  const nextRank = FOCUS_RANKS[FOCUS_RANKS.indexOf(rank) + 1]
  const rankProgress = ((hitRate - rank.min) / ((rank.max === 100 ? 100 : rank.max + 1) - rank.min)) * 100

  return (
    <div>
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">Your patterns</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">What the data says about how you work</p>
        </div>
        <Pill variant="neutral">30-day window</Pill>
      </div>

      <div className="px-8 pb-8">
        {/* Rank hero */}
        <Card gold className="px-6 py-5 mb-4 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.08),transparent_70%)] pointer-events-none" />
          <p className="text-[10px] uppercase tracking-[0.1em] text-gold mb-2 font-medium">
            Current rank
          </p>
          <p className="font-serif text-[30px] text-gold mb-1">
            {rank.label} {rank.icon}
          </p>
          <p className="text-[12px] text-ink-3 mb-4">
            {hitRate}% hit rate{nextRank ? ` · ${nextRank.min - hitRate}% away from ${nextRank.label} ${nextRank.icon}` : ' · Peak rank'}
          </p>
          <div>
            <div className="flex justify-between text-[10px] text-ink-4 mb-1">
              <span>{rank.label}</span>
              {nextRank && <span>{nextRank.label} →</span>}
            </div>
            <div className="h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, rankProgress)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Rank ladder */}
        <SectionTitle>The ladder</SectionTitle>
        <div className="rounded-[12px] overflow-hidden mb-5">
          {FOCUS_RANKS.map((r, i) => {
            const isCurrent = r.label === rank.label
            return (
              <div
                key={r.label}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5
                  border border-[var(--border)] bg-bg-3
                  ${i > 0 ? 'border-t-0' : ''}
                  ${i === 0 ? 'rounded-t-[10px]' : ''}
                  ${i === FOCUS_RANKS.length - 1 ? 'rounded-b-[10px]' : ''}
                  ${isCurrent ? 'bg-[var(--gold-dim)] border-[rgba(200,146,42,0.3)]' : ''}
                `}
              >
                <span className="text-[18px] w-6 text-center flex-shrink-0">{r.icon}</span>
                <span className={`text-[13px] font-medium min-w-[90px] ${isCurrent ? 'text-gold' : 'text-ink'}`}>
                  {r.label}
                </span>
                <span className={`text-[11px] flex-1 ${isCurrent ? 'text-gold' : 'text-ink-3'}`}>
                  {r.range}
                </span>
                {isCurrent && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--gold-dim)] text-gold border border-[rgba(200,146,42,0.2)]">
                    You are here
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Goal quality */}
        <SectionTitle>Goal quality score</SectionTitle>
        <Card className="px-4 py-4 mb-4">
          {[
            { label: 'Avg clarity', pct: 78, color: 'bg-gold', textColor: 'text-gold' },
            { label: 'Specific goals', pct: 91, color: 'bg-teal-bright', textColor: 'text-teal-bright', suffix: 'hit' },
            { label: 'Vague goals', pct: 44, color: 'bg-[rgba(192,57,43,0.7)]', textColor: 'text-[#e26b5e]', suffix: 'hit' },
          ].map(({ label, pct, color, textColor, suffix }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <span className="text-[10px] text-ink-3 min-w-[80px]">{label}</span>
              <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[11px] font-medium min-w-[40px] text-right ${textColor}`}>
                {pct}%{suffix ? ` ${suffix}` : ''}
              </span>
            </div>
          ))}
          <p className="text-[11px] text-ink-3 mt-2.5 pt-2.5 border-t border-[var(--border)] leading-relaxed">
            Specific goals hit <strong className="text-ink">2.1×</strong> more often. The quality check at setup is working.
          </p>
        </Card>

        {/* Hit rate by day */}
        <SectionTitle>Hit rate by day of week</SectionTitle>
        <Card className="px-4 py-4">
          <div className="flex items-end gap-2 h-20 mb-2">
            {DAY_BARS.map(({ label, pct, color }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div
                  className={`w-full rounded-t-[4px] cursor-pointer ${color}`}
                  style={{ height: `${pct}%` }}
                  title={`${pct}%`}
                />
                <span className="text-[10px] text-ink-3">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-3 mt-1">Wed & Thu are your power days. Fridays struggle at 40%.</p>
        </Card>

        {/* Pro lock for full insights */}
        {plan === 'free' && (
          <div className="mt-4 bg-[var(--gold-dim)] border border-[rgba(200,146,42,0.2)] rounded-[12px] px-4 py-4 text-center">
            <p className="text-[12px] text-ink mb-2 leading-snug">
              Full pattern analysis unlocks at Pro — see trends over 30+ days, day-of-week breakdown, and goal quality correlation.
            </p>
            <button className="bg-gold text-black text-[12px] font-semibold px-4 py-2 rounded-[8px] hover:opacity-90 transition-opacity">
              Unlock Pro insights — $4/mo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
