import type { DailyGoal } from '@/lib/types'

interface HeatmapProps {
  history: DailyGoal[]
  today: DailyGoal | null
}

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
}

export default function Heatmap({ history, today }: HeatmapProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const todayStr = now.toISOString().slice(0, 10)

  const days = getDaysInMonth(year, month)

  const goalMap = new Map<string, boolean>()
  for (const g of history) goalMap.set(g.date, g.completed)
  if (today) goalMap.set(today.date, today.completed)

  const monthName = now.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div>
      <p className="text-[9px] text-ink-4 font-medium uppercase tracking-[0.1em] mb-2">
        {monthName}
      </p>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <p key={i} className="text-[8px] text-ink-4 text-center">{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[3px]">
        {/* Offset for first day */}
        {Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }, (_, i) => (
          <div key={`empty-${i}`} className="h-4 rounded-[3px]" />
        ))}
        {days.map((date) => {
          const hit = goalMap.get(date) === true
          const miss = goalMap.has(date) && !goalMap.get(date)
          const isToday = date === todayStr
          const isFuture = date > todayStr
          return (
            <div
              key={date}
              title={new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              className={`h-4 rounded-[3px] transition-transform hover:scale-110 cursor-pointer
                ${isFuture ? 'bg-[rgba(255,255,255,0.03)]' : ''}
                ${!isFuture && !hit && !miss ? 'bg-[rgba(255,255,255,0.05)]' : ''}
                ${hit ? 'bg-gold' : ''}
                ${miss ? 'bg-[rgba(192,57,43,0.35)] border border-[rgba(192,57,43,0.2)]' : ''}
                ${isToday && !hit ? 'bg-[rgba(34,160,133,0.5)] border border-[rgba(34,160,133,0.3)]' : ''}
              `}
            />
          )
        })}
      </div>
    </div>
  )
}
