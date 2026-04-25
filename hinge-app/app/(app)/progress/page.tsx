'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { scoreGoalQuality } from '@/lib/goalQuality'
import type { DailyGoal } from '@/lib/types'
import { getGoalHeadline } from '@/lib/types'
import Pill from '@/components/ui/Pill'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import ContributionHeatmap from '@/components/history/ContributionHeatmap'
import PersonalRecords from '@/components/history/PersonalRecords'
import PatternCallouts from '@/components/insights/PatternCallouts'
import { FOCUS_RANKS } from '@/lib/types'

// ── shared helpers ────────────────────────────────────────────────────────────

const PAYWALL_THRESHOLD = Infinity

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })
}

function calcHitRate(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0
  return Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)
}

// ── day-of-week helpers ───────────────────────────────────────────────────────

const DAY_LABELS  = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_JS_INDEX = [1, 2, 3, 4, 5, 6, 0]

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
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const bestIdx  = bars.indexOf(best)
  const worstIdx = bars.indexOf(worst)
  return { best: names[bestIdx] ?? best.label, bestPct: best.pct, worst: names[worstIdx] ?? worst.label, worstPct: worst.pct }
}

// ── milestones ────────────────────────────────────────────────────────────────

const MILESTONE_DEFS = [
  { emoji: '🌱', label: 'First win',  sub: 'Day 1',             requiredStreak: 1,   special: false },
  { emoji: '🔥', label: 'Week one',   sub: '7 days',            requiredStreak: 7,   special: false },
  { emoji: '⚡', label: 'On a roll',  sub: '14 days',           requiredStreak: 14,  special: false },
  { emoji: '🎯', label: 'Month one',  sub: '30 days',           requiredStreak: 30,  special: false },
  { emoji: '💯', label: 'Century',    sub: '100 days',          requiredStreak: 100, special: false },
  { emoji: '🏔️', label: 'Summit',    sub: '365 days',          requiredStreak: 365, special: false },
  { emoji: '🔪', label: 'Sharp',      sub: '10 specific goals', requiredStreak: 0,   special: true  },
  { emoji: '🤝', label: 'Teamwork',   sub: '5 collab tasks',    requiredStreak: 0,   special: true  },
]

function MilestoneBadge({ emoji, label, sub, earned, onTap }: {
  emoji: string; label: string; sub: string; earned: boolean; onTap: () => void
}) {
  return (
    <div
      onClick={earned ? onTap : undefined}
      className={`
        flex flex-col items-center px-2.5 py-4 bg-bg-3
        border rounded-[13px] relative transition-all duration-150
        ${earned
          ? 'border-[var(--border2)] cursor-pointer hover:border-[rgba(200,146,42,0.5)] hover:bg-[var(--gold-dim)]'
          : 'border-[var(--border)] opacity-25 grayscale'}
      `}
    >
      {earned && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-bright" />}
      <p className="text-[26px] mb-1.5">{emoji}</p>
      <p className="text-[11px] font-medium text-ink mb-0.5">{label}</p>
      <p className="text-[9px] text-ink-3">{sub}</p>
    </div>
  )
}

// ── tab types ─────────────────────────────────────────────────────────────────

type Tab = 'history' | 'insights' | 'badges'

const TABS: { id: Tab; label: string }[] = [
  { id: 'history',  label: 'History'  },
  { id: 'insights', label: 'Insights' },
  { id: 'badges',   label: 'Badges'   },
]

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { history, today, plan, hydrated, streaks } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [toast, setToast] = useState<string | null>(null)
  const dismiss = useCallback(() => setToast(null), [])

  if (!hydrated) return null

  // ── History data ──────────────────────────────────────────────────────────
  const allGoals    = today
    ? [today, ...history].filter((g, i, arr) => arr.findIndex((x) => x.date === g.date) === i)
    : history
  const recentGoals = allGoals.slice(0, PAYWALL_THRESHOLD)
  const lockedGoals = allGoals.slice(PAYWALL_THRESHOLD)

  // ── Insights data ─────────────────────────────────────────────────────────
  const window30   = history.slice(0, 30)
  const hitRate    = calcHitRate(window30)
  const rank       = FOCUS_RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
  const nextRank   = FOCUS_RANKS[FOCUS_RANKS.indexOf(rank) + 1]
  const rankProgress = ((hitRate - rank.min) / ((rank.max === 100 ? 100 : rank.max + 1) - rank.min)) * 100
  const dayBars    = DAY_JS_INDEX.map((jsDay, i) => {
    const dayGoals = window30.filter((g) => new Date(g.date + 'T00:00:00').getDay() === jsDay)
    const pct = dayGoals.length > 0
      ? Math.round(dayGoals.filter((g) => g.completed).length / dayGoals.length * 100) : 0
    return { label: DAY_LABELS[i], pct, count: dayGoals.length }
  })
  const dayInsight  = bestAndWorstDays(dayBars)
  const scoredGoals = window30
    .filter((g) => getGoalHeadline(g).trim().length > 0)
    .map((g) => ({ ...g, qualityScore: scoreGoalQuality(getGoalHeadline(g)).score }))
  const specificGoals = scoredGoals.filter((g) => g.qualityScore >= 70)
  const vagueGoals    = scoredGoals.filter((g) => g.qualityScore < 35)
  const avgClarity      = scoredGoals.length > 0 ? Math.round(scoredGoals.reduce((s, g) => s + g.qualityScore, 0) / scoredGoals.length) : 0
  const specificHitRate = specificGoals.length > 0 ? Math.round(specificGoals.filter((g) => g.completed).length / specificGoals.length * 100) : 0
  const vagueHitRate    = vagueGoals.length > 0 ? Math.round(vagueGoals.filter((g) => g.completed).length / vagueGoals.length * 100) : 0
  const MIN_QUALITY_SAMPLES = 3
  const hasQualityComparison = specificGoals.length >= MIN_QUALITY_SAMPLES && vagueGoals.length >= MIN_QUALITY_SAMPLES
  const multiplier = hasQualityComparison && vagueHitRate > 0 ? (specificHitRate / vagueHitRate).toFixed(1) : null
  const hasEnoughData  = window30.length >= 3
  const hasQualityData = scoredGoals.length >= MIN_QUALITY_SAMPLES

  // ── Milestones data ───────────────────────────────────────────────────────
  const maxStreak = Math.max(streaks.current, streaks.personalBest)
  const specificGoalCount = history.filter((g) => getGoalHeadline(g).split(/\s+/).length >= 5).length
  const collabTaskCount   = history.filter((g) => {
    const text = g.templateType === 'focus' || g.templateType === 'mit' ? g.task1Text + g.task2Text : ''
    return /\b(with|alex|team|review|pair|together|manager|colleague)\b/i.test(text)
  }).length
  function isEarned(m: typeof MILESTONE_DEFS[0]): boolean {
    if (m.special) {
      if (m.label === 'Sharp')    return specificGoalCount >= 10
      if (m.label === 'Teamwork') return collabTaskCount >= 5
      return false
    }
    return maxStreak >= m.requiredStreak
  }
  const earned = MILESTONE_DEFS.filter(isEarned)
  const locked = MILESTONE_DEFS.filter((m) => !isEarned(m))

  return (
    <div>
      {/* Page header */}
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">Progress</h1>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {activeTab === 'history'  && 'Every goal you\'ve set, and whether you hit it'}
            {activeTab === 'insights' && 'What the data says about how you work'}
            {activeTab === 'badges'   && 'Proof the habit stuck · tap any earned badge'}
          </p>
        </div>
        {activeTab === 'history'  && <Pill variant="neutral">{allGoals.length} entries</Pill>}
        {activeTab === 'insights' && <Pill variant="neutral">30-day window</Pill>}
      </div>

      {/* Tab switcher */}
      <div className="mb-5">
        <div className="flex bg-bg-3 border border-[var(--border)] rounded-none p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-all duration-150
                ${activeTab === tab.id
                  ? 'bg-gold text-black shadow-sm'
                  : 'text-ink-3 hover:text-ink'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-8">

        {/* ── HISTORY TAB ────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <>
            <section className="mb-5">
              <SectionTitle>Activity</SectionTitle>
              <ContributionHeatmap history={history} today={today} />
            </section>

            <section className="mb-5">
              <SectionTitle>Personal records</SectionTitle>
              <PersonalRecords history={history} streaks={streaks} />
            </section>

            {recentGoals.length === 0 && (
              <p className="text-ink-3 text-[14px]">No goals yet. Start your first morning setup.</p>
            )}

            {recentGoals.length > 0 && (
              <>
                <SectionTitle>All goals</SectionTitle>
                {recentGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                      <p className="text-[14px] font-medium text-ink">{getGoalHeadline(goal)}</p>
                    </div>
                    <Pill variant={goal.completed ? 'teal' : 'red'}>
                      {goal.completed ? 'Hit ✓' : 'Missed'}
                    </Pill>
                  </div>
                ))}
              </>
            )}

            {lockedGoals.length > 0 && plan === 'free' && (
              <div className="mt-5">
                <SectionTitle>Beyond 7 days — Pro</SectionTitle>
                <div className="relative">
                  <div className="blur-locked select-none pointer-events-none">
                    {lockedGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center">
                        <div>
                          <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                          <p className="text-[14px] font-medium text-ink">{'█'.repeat(Math.floor(Math.random() * 10) + 10)}</p>
                        </div>
                        <Pill variant={goal.completed ? 'teal' : 'red'}>{goal.completed ? 'Hit ✓' : 'Missed'}</Pill>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(14,13,11,0.75)] rounded-[12px] px-3.5 py-4 text-center">
                    <p className="text-[18px] mb-1.5">🔒</p>
                    <p className="text-[12px] font-medium text-ink mb-2 leading-snug">
                      Your full history is waiting.<br />Upgrade to see every goal you&apos;ve set.
                    </p>
                    <Button size="sm">Unlock with Pro — $4/mo</Button>
                  </div>
                </div>
              </div>
            )}

            {lockedGoals.length > 0 && plan === 'pro' && (
              <div className="mt-5">
                <SectionTitle>Full history</SectionTitle>
                {lockedGoals.map((goal) => (
                  <div key={goal.id} className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-ink-3 mb-0.5">{formatDate(goal.date)}</p>
                      <p className="text-[14px] font-medium text-ink">{getGoalHeadline(goal)}</p>
                    </div>
                    <Pill variant={goal.completed ? 'teal' : 'red'}>{goal.completed ? 'Hit ✓' : 'Missed'}</Pill>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── INSIGHTS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'insights' && (
          <>
            {!hasEnoughData && (
              <div className="mb-5 bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-4 text-center">
                <p className="text-[13px] text-ink-3 leading-relaxed">
                  Complete at least 3 days to start seeing your patterns.
                  You have <strong className="text-ink">{window30.length}</strong> so far.
                </p>
              </div>
            )}

            <PatternCallouts history={history} streaks={streaks} />

            <Card gold className="px-6 py-5 mb-4 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.08),transparent_70%)] pointer-events-none" />
              <p className="text-[10px] uppercase tracking-[0.1em] text-gold mb-2 font-medium">Current rank</p>
              <p className="font-serif text-[30px] text-gold mb-1">{rank.label} {rank.icon}</p>
              <p className="text-[12px] text-ink-3 mb-4">
                {hitRate}% hit rate{nextRank ? ` · ${nextRank.min - hitRate}% away from ${nextRank.label} ${nextRank.icon}` : ' · Peak rank'}
              </p>
              <div>
                <div className="flex justify-between text-[10px] text-ink-4 mb-1">
                  <span>{rank.label}</span>
                  {nextRank && <span>{nextRank.label} →</span>}
                </div>
                <div className="h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${Math.min(100, rankProgress)}%` }} />
                </div>
              </div>
            </Card>

            <SectionTitle>The ladder</SectionTitle>
            <div className="rounded-[12px] overflow-hidden mb-5">
              {FOCUS_RANKS.map((r, i) => {
                const isCurrent = r.label === rank.label
                return (
                  <div key={r.label} className={`flex items-center gap-3 px-3.5 py-2.5 border border-[var(--border)] bg-bg-3 ${i > 0 ? 'border-t-0' : ''} ${i === 0 ? 'rounded-t-[10px]' : ''} ${i === FOCUS_RANKS.length - 1 ? 'rounded-b-[10px]' : ''} ${isCurrent ? 'bg-[var(--gold-dim)] border-[rgba(200,146,42,0.3)]' : ''}`}>
                    <span className="text-[18px] w-6 text-center flex-shrink-0">{r.icon}</span>
                    <span className={`text-[13px] font-medium min-w-[90px] ${isCurrent ? 'text-gold' : 'text-ink'}`}>{r.label}</span>
                    <span className={`text-[11px] flex-1 ${isCurrent ? 'text-gold' : 'text-ink-3'}`}>{r.range}</span>
                    {isCurrent && <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--gold-dim)] text-gold border border-[rgba(200,146,42,0.2)]">You are here</span>}
                  </div>
                )
              })}
            </div>

            <SectionTitle>Goal quality score</SectionTitle>
            <Card className="px-4 py-4 mb-4">
              {!hasQualityData ? (
                <p className="text-[12px] text-ink-3 text-center py-2 leading-relaxed">
                  Complete at least {MIN_QUALITY_SAMPLES} days to see goal quality patterns.<br />
                  <span className="text-ink">{scoredGoals.length}</span> of {MIN_QUALITY_SAMPLES} needed.
                </p>
              ) : (
                <>
                  {[
                    { label: 'Avg clarity',    pct: avgClarity,      color: 'bg-gold',                  textColor: 'text-gold',        title: 'Average quality score' },
                    { label: 'Specific → hit', pct: specificHitRate, color: 'bg-teal-bright',           textColor: 'text-teal-bright', title: `${specificGoals.length} specific goals` },
                    { label: 'Vague → hit',    pct: vagueHitRate,    color: 'bg-[rgba(192,57,43,0.7)]', textColor: 'text-[#e26b5e]',   title: `${vagueGoals.length} vague goals` },
                  ].map(({ label, pct, color, textColor, title }) => (
                    <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0" title={title}>
                      <span className="text-[10px] text-ink-3 min-w-[84px]">{label}</span>
                      <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[11px] font-medium min-w-[32px] text-right ${textColor}`}>{pct}%</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-ink-3 mt-2.5 pt-2.5 border-t border-[var(--border)] leading-relaxed">
                    {multiplier
                      ? <>Specific goals hit <strong className="text-ink">{multiplier}×</strong> more often.</>
                      : vagueGoals.length === 0
                        ? `All ${scoredGoals.length} goals are specific — keep it up.`
                        : `Need ${MIN_QUALITY_SAMPLES} of each type to compare.`}
                  </p>
                </>
              )}
            </Card>

            <SectionTitle>Hit rate by day of week</SectionTitle>
            <Card className="px-4 py-4">
              <div className="flex items-end gap-2 h-20 mb-2">
                {dayBars.map(({ label, pct, count }, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                    <div className={`w-full rounded-t-[4px] ${dayBarColor(pct)}`} style={{ height: pct > 0 ? `${pct}%` : '4px' }} title={count > 0 ? `${pct}% (${count} day${count !== 1 ? 's' : ''})` : 'No data'} />
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

            {plan === 'free' && (
              <div className="mt-4 bg-[var(--gold-dim)] border border-[rgba(200,146,42,0.2)] rounded-[12px] px-4 py-4 text-center">
                <p className="text-[12px] text-ink mb-2 leading-snug">
                  Full pattern analysis unlocks at Pro.
                </p>
                <button className="bg-gold text-black text-[12px] font-semibold px-4 py-2 rounded-[8px] hover:opacity-90 transition-opacity">
                  Unlock Pro — $4/mo
                </button>
              </div>
            )}
          </>
        )}

        {/* ── BADGES TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'badges' && (
          <>
            {earned.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">Earned</p>
                <div className="grid grid-cols-4 gap-2.5 mb-5">
                  {earned.map((m) => (
                    <MilestoneBadge key={m.label} {...m} earned onTap={() => setToast(`${m.emoji} ${m.label} — ${m.sub}!`)} />
                  ))}
                </div>
              </>
            )}
            {locked.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">Locked</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {locked.map((m) => (
                    <MilestoneBadge key={m.label} {...m} earned={false} onTap={() => {}} />
                  ))}
                </div>
              </>
            )}
            <div className="mt-6 text-center">
              <p className="text-[12px] text-ink-3">
                Current streak: <strong className="text-ink">{streaks.current}</strong> ·{' '}
                Personal best: <strong className="text-ink">{streaks.personalBest}</strong>
              </p>
            </div>
          </>
        )}
      </div>

      {toast && <Toast message={toast} onDone={dismiss} />}
    </div>
  )
}
