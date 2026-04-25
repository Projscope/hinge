'use client'

import type { DailyGoal, Streaks, AreaTag } from '@/lib/types'
import { AREA_TAGS } from '@/lib/types'

interface Props {
  history: DailyGoal[]
  streaks: Streaks
}

interface StatCard {
  value: string
  label: string
  subtext: string
  isRecord: boolean
}

function calcHitRate(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0
  return Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)
}

export default function PersonalRecords({ history, streaks }: Props) {
  if (history.length < 3) {
    return (
      <div
        className="bg-bg-3 border border-[var(--border)] rounded-[14px] p-4 mb-4 text-center"
      >
        <p className="text-[12px] text-ink-3">Play more days to unlock records</p>
      </div>
    )
  }

  // Total hits
  const totalHits = history.filter((g) => g.completed).length

  // Best month — find calendar month with highest hit rate (min 5 goals)
  const monthMap = new Map<string, DailyGoal[]>()
  for (const g of history) {
    const key = g.date.slice(0, 7) // 'YYYY-MM'
    if (!monthMap.has(key)) monthMap.set(key, [])
    monthMap.get(key)!.push(g)
  }
  let bestMonth: { label: string; rate: number } | null = null
  for (const [key, goals] of monthMap.entries()) {
    if (goals.length < 5) continue
    const rate = calcHitRate(goals)
    if (!bestMonth || rate > bestMonth.rate) {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      bestMonth = { label, rate }
    }
  }

  // Best area — which areaTag has highest hit rate (min 3 goals)
  const areaMap = new Map<AreaTag, DailyGoal[]>()
  for (const g of history) {
    if (g.templateType !== 'focus' || !g.areaTag) continue
    if (!areaMap.has(g.areaTag)) areaMap.set(g.areaTag, [])
    areaMap.get(g.areaTag)!.push(g)
  }
  let bestArea: { tag: AreaTag; rate: number } | null = null
  for (const [tag, goals] of areaMap.entries()) {
    if (goals.length < 3) continue
    const rate = calcHitRate(goals)
    if (!bestArea || rate > bestArea.rate) {
      bestArea = { tag, rate }
    }
  }

  // Current form — last 7 days hits
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
  const last7 = sorted.slice(0, 7)
  const last7Hits = last7.filter((g) => g.completed).length

  const cards: StatCard[] = [
    {
      value: String(streaks.personalBest),
      label: 'Longest streak',
      subtext: `Current: ${streaks.current} day${streaks.current !== 1 ? 's' : ''}`,
      isRecord: true,
    },
    {
      value: bestMonth ? `${bestMonth.rate}%` : '—',
      label: 'Best month',
      subtext: bestMonth ? bestMonth.label : 'Need 5+ goals in a month',
      isRecord: true,
    },
    {
      value: bestArea ? `${AREA_TAGS[bestArea.tag].icon} ${bestArea.rate}%` : '—',
      label: 'Best area',
      subtext: bestArea ? `${AREA_TAGS[bestArea.tag].label} hit rate` : 'Need 3+ goals per area',
      isRecord: true,
    },
    {
      value: String(totalHits),
      label: 'Total hits',
      subtext: `of ${history.length} goals set`,
      isRecord: false,
    },
    {
      value: `${last7Hits} of ${last7.length}`,
      label: 'Current form',
      subtext: 'hits in last 7 days',
      isRecord: false,
    },
  ]

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-3 border border-[var(--border)] rounded-[14px] p-4"
            style={card.isRecord ? { borderLeft: '2px solid #c8922a' } : undefined}
          >
            <p className="font-serif text-[28px] text-ink leading-none mb-1">{card.value}</p>
            <p className="text-[11px] text-ink-3">{card.label}</p>
            <p className="text-[10px] text-ink-4 mt-0.5">{card.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
