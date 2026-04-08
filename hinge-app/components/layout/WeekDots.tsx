import type { DailyGoal } from '@/lib/types'
import { localDateStr } from '@/lib/dateUtils'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface WeekDotsProps {
  history: DailyGoal[]
  today: DailyGoal | null
}

function getThisWeekDays(): string[] {
  const now = new Date()
  const monday = new Date(now)
  const day = now.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(now.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return localDateStr(d)
  })
}

export default function WeekDots({ history, today }: WeekDotsProps) {
  const days = getThisWeekDays()
  const todayStr = localDateStr()

  const goalMap = new Map<string, boolean>()
  for (const g of history) goalMap.set(g.date, g.completed)
  if (today) goalMap.set(today.date, today.completed)

  const hits = days.filter((d) => goalMap.get(d) === true).length
  const daysWithGoal = days.filter((d) => goalMap.has(d) && d <= todayStr).length
  const pct = daysWithGoal > 0 ? Math.round((hits / daysWithGoal) * 100) : 0

  return (
    <div>
      <div className="flex justify-between mb-1">
        {days.map((date, i) => {
          const hit = goalMap.get(date) === true
          const miss = goalMap.has(date) && !goalMap.get(date)
          const isToday = date === todayStr
          return (
            <div key={date} className="text-center">
              <div
                className={`w-[22px] h-[22px] rounded-full mx-auto mb-0.5 transition-colors
                  ${isToday && !hit && !miss ? 'bg-[rgba(200,146,42,0.4)] border border-[rgba(200,146,42,0.3)]' : ''}
                  ${hit ? 'bg-[rgba(42,184,126,1)]' : ''}
                  ${miss ? 'bg-[rgba(192,57,43,0.6)] border border-[rgba(192,57,43,0.4)]' : ''}
                  ${!hit && !miss && !isToday ? 'bg-[rgba(255,255,255,0.06)]' : ''}
                `}
              />
              <p className={`text-[9px] ${isToday ? 'text-teal-bright font-medium' : 'text-ink-4'}`}>
                {DAY_LABELS[i]}
              </p>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-ink-3 text-center mt-1">
        {hits} of {daysWithGoal} · {pct}% this week
      </p>
    </div>
  )
}
