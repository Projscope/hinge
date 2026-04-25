'use client'

import { useAppStore } from '@/lib/store'
import { scoreGoalQuality } from '@/lib/goalQuality'
import type { DailyGoal } from '@/lib/types'
import Pill from '@/components/ui/Pill'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import { FOCUS_RANKS } from '@/lib/types'
import PatternCallouts from '@/components/insights/PatternCallouts'

// Mon=0 … Sun=6 (display order)
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_JS_INDEX = [1, 2, 3, 4, 5, 6, 0] // JS getDay(): Sun=0

function calcHitRate(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0
  return Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)
}

function dayBarColor(pct: number): string {
  if (pct >= 70) return 'bg-teal-bright'
  if (pct >= 50) return 'bg-gold opacity-70'
  if (pct > 0)   return 'bg-[rgba(192,57,43,0.6)]'
  return 'bg-[rgba(255,255,255,0.08)]'
}

function bestAndWorstDays(bars: { label: string; pct: number; count: number }[]) {
  const withData = bars.filter((b) => b.count > 0)
  if (withData.length < 2) return null
  const best  = withData.reduce((a, b) => (b.pct > a.pct ? b : a))
  const worst = withData.reduce((a, b) => (b.pct < a.pct ? b : a))
  const dayName = (label: string, idx: number) => {
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return names[idx] ?? label
  }
  const bestIdx  = bars.indexOf(best)
  const worstIdx = bars.indexOf(worst)
  return { best: dayName(best.label, bestIdx), bestPct: best.pct, worst: dayName(worst.label, worstIdx), worstPct: worst.pct }
}

export default function InsightsPage() {
  const { history, plan, hydrated, streaks } = useAppStore()

  if (!hydrated) return null

  const window30 = history.slice(0, 30)
  const hitRate  = calcHitRate(window30)
  const rank     = FOCUS_RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
  const nextRank = FOCUS_RANKS[FOCUS_RANKS.indexOf(rank) + 1]
  const rankProgress = ((hitRate - rank.min) / ((rank.max === 100 ? 100 : rank.max + 1) - rank.min)) * 100

  // ── Day-of-week hit rates ────────────────────────────────────────────────
  const dayBars = DAY_JS_INDEX.map((jsDay, i) => {
    const dayGoals = window30.filter((g) => new Date(g.date + 'T00:00:00').getDay() === jsDay)
    const pct = dayGoals.length > 0
      ? Math.round(dayGoals.filter((g) => g.completed).length / dayGoals.length * 100)
      : 0
    return { label: DAY_LABELS[i], pct, count: dayGoals.length }
  })

  const dayInsight = bestAndWorstDays(dayBars)

  // ── Goal quality split ───────────────────────────────────────────────────
  // Guard against null mainGoal values from the DB
  const scoredGoals = window30
    .filter((g) => g.mainGoal && g.mainGoal.trim().length > 0)
    .map((g) => ({
      ...g,
      qualityScore: scoreGoalQuality(g.mainGoal).score,
    }))

  const specificGoals = scoredGoals.filter((g) => g.qualityScore >= 70)
  const vagueGoals    = scoredGoals.filter((g) => g.qualityScore < 35)

  const avgClarity       = scoredGoals.length > 0
    ? Math.round(scoredGoals.reduce((s, g) => s + g.qualityScore, 0) / scoredGoals.length)
    : 0
  const specificHitRate  = specificGoals.length > 0
    ? Math.round(specificGoals.filter((g) => g.completed).length / specificGoals.length * 100)
    : 0
  const vagueHitRate     = vagueGoals.length > 0
    ? Math.round(vagueGoals.filter((g) => g.completed).length / vagueGoals.length * 100)
    : 0

  // Only show multiplier comparison when both groups have meaningful sample sizes
  const MIN_QUALITY_SAMPLES = 3
  const hasQualityComparison = specificGoals.length >= MIN_QUALITY_SAMPLES && vagueGoals.length >= MIN_QUALITY_SAMPLES
  const multiplier = hasQualityComparison && vagueHitRate > 0
    ? (specificHitRate / vagueHitRate).toFixed(1)
    : null

  const hasEnoughData = window30.length >= 3
  // Goal quality needs its own threshold — enough scored goals to be meaningful
  const hasQualityData = scoredGoals.length >= MIN_QUALITY_SAMPLES

  return (
    <div>
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">Your patterns</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">What the data says about how you work</p>
        </div>
        <Pill variant="neutral">30-day window</Pill>
      </div>

      {!hasEnoughData && (
        <div className="px-8 pb-8">
          <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-5 py-6 text-center">
            <p className="font-serif text-[20px] text-ink mb-2">Patterns form at day 3.</p>
            <p className="text-[13px] text-ink-3 leading-relaxed mb-5">
              Your insights will appear once you have enough data to be meaningful.
            </p>
            {/* Progress indicator */}
            <div className="max-w-[240px] mx-auto mb-2">
              <div className="flex justify-between text-[10px] text-ink-4 mb-1.5">
                <span>Progress</span>
                <span>{window30.length} / 3 days</span>
              </div>
              <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${Math.min(100, (window30.length / 3) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-ink-4">{3 - window30.length} more day{3 - window30.length !== 1 ? 's' : ''} to go</p>
          </div>
        </div>
      )}

      {hasEnoughData && <div className="px-8 pb-8">
        {/* Pattern callouts */}
        <PatternCallouts history={history} streaks={streaks} />

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
          {!hasQualityData ? (
            <p className="text-[12px] text-ink-3 text-center py-2 leading-relaxed">
              Complete at least {MIN_QUALITY_SAMPLES} days to see goal quality patterns.
              <br />
              <span className="text-ink">{scoredGoals.length}</span> of {MIN_QUALITY_SAMPLES} needed.
            </p>
          ) : (
            <>
              {[
                { label: 'Avg clarity',    pct: avgClarity,      color: 'bg-gold',                   textColor: 'text-gold',         title: 'Average quality score of your goals' },
                { label: 'Specific → hit', pct: specificHitRate, color: 'bg-teal-bright',            textColor: 'text-teal-bright',  title: `${specificGoals.length} specific goals` },
                { label: 'Vague → hit',    pct: vagueHitRate,    color: 'bg-[rgba(192,57,43,0.7)]',  textColor: 'text-[#e26b5e]',    title: `${vagueGoals.length} vague goals` },
              ].map(({ label, pct, color, textColor, title }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0" title={title}>
                  <span className="text-[10px] text-ink-3 min-w-[84px]">{label}</span>
                  <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[11px] font-medium min-w-[32px] text-right ${textColor}`}>
                    {pct}%
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-ink-3 mt-2.5 pt-2.5 border-t border-[var(--border)] leading-relaxed">
                {multiplier
                  ? <>Specific goals hit <strong className="text-ink">{multiplier}×</strong> more often. The quality check at setup is working.</>
                  : vagueGoals.length === 0
                    ? `All ${scoredGoals.length} goals are specific — keep it up.`
                    : `Need ${MIN_QUALITY_SAMPLES} of each type to compare specific vs vague hit rates.`}
              </p>
            </>
          )}
        </Card>

        {/* Hit rate by day */}
        <SectionTitle>Hit rate by day of week</SectionTitle>
        <Card className="px-4 py-4">
          <div className="flex items-end gap-2 h-20 mb-2">
            {dayBars.map(({ label, pct, count }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div
                  className={`w-full rounded-t-[4px] ${dayBarColor(pct)}`}
                  style={{ height: pct > 0 ? `${pct}%` : '4px' }}
                  title={count > 0 ? `${pct}% (${count} day${count !== 1 ? 's' : ''})` : 'No data'}
                />
                <span className="text-[10px] text-ink-3">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-3 mt-1">
            {dayInsight
              ? `${dayInsight.best}s are your best at ${dayInsight.bestPct}%. ${dayInsight.worst}s struggle at ${dayInsight.worstPct}%.`
              : 'Complete more days to see your day-of-week patterns.'}
          </p>
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
      </div>}
    </div>
  )
}
