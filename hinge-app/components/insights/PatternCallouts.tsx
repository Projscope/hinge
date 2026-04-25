'use client'

import type { DailyGoal, AreaTag } from '@/lib/types'
import { AREA_TAGS, getGoalHeadline } from '@/lib/types'
import { scoreGoalQuality } from '@/lib/goalQuality'
import { localDateStr } from '@/lib/dateUtils'

interface Props {
  history: DailyGoal[]
  streaks: { current: number; personalBest: number; lastActiveDate: string | null }
}

interface Callout {
  icon: string
  headline: string
  body: string
}

function hitRate(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0
  return Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function PatternCallouts({ history, streaks }: Props) {
  if (history.length < 5) {
    return (
      <div
        className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-4 text-center"
      >
        <p className="text-[11px] text-ink-3">Complete more days to surface patterns</p>
      </div>
    )
  }

  const callouts: Callout[] = []

  // 1. Area imbalance
  const areaMap = new Map<AreaTag, DailyGoal[]>()
  for (const g of history) {
    if (!g.areaTag) continue
    if (!areaMap.has(g.areaTag)) areaMap.set(g.areaTag, [])
    areaMap.get(g.areaTag)!.push(g)
  }
  const areaRates: { tag: AreaTag; rate: number; count: number }[] = []
  for (const [tag, goals] of areaMap.entries()) {
    if (goals.length >= 3) {
      areaRates.push({ tag, rate: hitRate(goals), count: goals.length })
    }
  }
  if (areaRates.length >= 2) {
    const best = areaRates.reduce((a, b) => (b.rate > a.rate ? b : a))
    const worst = areaRates.reduce((a, b) => (b.rate < a.rate ? b : a))
    if (best.tag !== worst.tag && best.rate - worst.rate > 20) {
      callouts.push({
        icon: '⚖️',
        headline: `You hit ${AREA_TAGS[best.tag].label} goals ${Math.round(best.rate / Math.max(1, worst.rate))}× more than ${AREA_TAGS[worst.tag].label}`,
        body: `${AREA_TAGS[best.tag].icon} ${AREA_TAGS[best.tag].label} ${best.rate}% vs ${AREA_TAGS[worst.tag].icon} ${AREA_TAGS[worst.tag].label} ${worst.rate}%. Consider why.`,
      })
    }
  }

  // 2. Day-of-week strength
  const dayMap = new Map<number, DailyGoal[]>()
  for (const g of history) {
    const dow = new Date(g.date + 'T00:00:00').getDay()
    if (!dayMap.has(dow)) dayMap.set(dow, [])
    dayMap.get(dow)!.push(g)
  }
  const dayRates: { dow: number; rate: number; count: number }[] = []
  for (const [dow, goals] of dayMap.entries()) {
    if (goals.length >= 2) {
      dayRates.push({ dow, rate: hitRate(goals), count: goals.length })
    }
  }
  if (dayRates.length >= 2) {
    const bestDay = dayRates.reduce((a, b) => (b.rate > a.rate ? b : a))
    const worstDay = dayRates.reduce((a, b) => (b.rate < a.rate ? b : a))
    if (bestDay.dow !== worstDay.dow && bestDay.rate - worstDay.rate > 20) {
      callouts.push({
        icon: '📅',
        headline: `${DAY_NAMES[bestDay.dow]}s are your best day`,
        body: `${bestDay.rate}% hit rate on ${DAY_NAMES[bestDay.dow]}s. Schedule your hardest goals then.`,
      })
    }
  }

  // 3. Streak momentum
  if (streaks.current >= 3) {
    callouts.push({
      icon: '🔥',
      headline: `You're on a ${streaks.current}-day run`,
      body: "Don't break the chain.",
    })
  } else if (streaks.current === 0 && streaks.personalBest >= 5) {
    callouts.push({
      icon: '💪',
      headline: `You had a ${streaks.personalBest}-day streak before`,
      body: 'You know you can do it.',
    })
  }

  // 4. Goal quality
  const scoredGoals = history
    .filter((g) => getGoalHeadline(g).trim().length > 0)
    .map((g) => ({ ...g, qualityScore: scoreGoalQuality(getGoalHeadline(g)).score }))
  const specificGoals = scoredGoals.filter((g) => g.qualityScore >= 70)
  const vagueGoals = scoredGoals.filter((g) => g.qualityScore < 35)
  if (specificGoals.length >= 3 && vagueGoals.length >= 3) {
    const specificRate = hitRate(specificGoals)
    const vagueRate = hitRate(vagueGoals)
    if (specificRate - vagueRate > 15) {
      callouts.push({
        icon: '🎯',
        headline: `Specific goals land ${specificRate - vagueRate}% more often`,
        body: 'Keep writing them that way.',
      })
    }
  }

  // 5. Volume trend
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const cutoff14 = new Date(now)
  cutoff14.setDate(cutoff14.getDate() - 14)
  const cutoff28 = new Date(now)
  cutoff28.setDate(cutoff28.getDate() - 28)
  const cutoff14Str = localDateStr(cutoff14)
  const cutoff28Str = localDateStr(cutoff28)
  const todayStr = localDateStr(now)

  const recent14 = history.filter((g) => g.date > cutoff14Str && g.date <= todayStr)
  const prior14 = history.filter((g) => g.date > cutoff28Str && g.date <= cutoff14Str)

  if (prior14.length >= 3 && recent14.length < prior14.length * 0.7) {
    const recentPerWeek = (recent14.length / 2).toFixed(1)
    const priorPerWeek = (prior14.length / 2).toFixed(1)
    callouts.push({
      icon: '📉',
      headline: 'Your pace is slowing',
      body: `You averaged ${recentPerWeek} goals/week recently vs ${priorPerWeek} before.`,
    })
  }

  // Limit to 4
  const shown = callouts.slice(0, 4)

  if (shown.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      {shown.map((c, i) => (
        <div
          key={i}
          className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3 mb-2 flex gap-3 items-start"
          style={{ borderLeft: '2px solid #c8922a' }}
        >
          <span style={{ fontSize: 20, lineHeight: 1.3, flexShrink: 0 }}>{c.icon}</span>
          <div>
            <p className="text-[13px] font-medium text-ink">{c.headline}</p>
            <p className="text-[11px] text-ink-3 mt-0.5">{c.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
