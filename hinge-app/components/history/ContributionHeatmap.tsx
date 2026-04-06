'use client'

import { useMemo, useRef, useState } from 'react'
import type { DailyGoal } from '@/lib/types'
import { localDateStr } from '@/lib/dateUtils'

interface Props {
  history: DailyGoal[]
  today: DailyGoal | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''] // M, W, F shown; others blank

// Returns 'YYYY-MM-DD' in local timezone for a Date object
function toDateStr(d: Date): string {
  return localDateStr(d)
}

// Offset today's local date by N days back
function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

export default function ContributionHeatmap({ history, today }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  // Build date → goal map
  const goalMap = useMemo(() => {
    const map = new Map<string, DailyGoal>()
    for (const g of history) map.set(g.date, g)
    if (today) map.set(today.date, today)
    return map
  }, [history, today])

  const todayStr = toDateStr(new Date())

  // We need 112 days = 16 weeks.
  // Layout: columns = weeks (left=oldest, right=newest), rows = Mon(0)…Sun(6)
  // Find what day-of-week today is (Mon=0…Sun=6)
  const todayDow = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    // JS: Sun=0, Mon=1…Sat=6 → convert to Mon=0…Sun=6
    return (d.getDay() + 6) % 7
  })()

  // Total cells in grid: 16 cols × 7 rows = 112
  // The last column ends at today (row = todayDow), and the cell below today in the last column are future (not shown / empty)
  // Build grid: grid[col][row] where col 0 = oldest week, col 15 = this week
  const COLS = 16
  const ROWS = 7

  type Cell = {
    dateStr: string
    goal: DailyGoal | null
    isFuture: boolean
    isToday: boolean
  }

  const grid: Cell[][] = useMemo(() => {
    const cols: Cell[][] = []
    // today is at col=15, row=todayDow
    // total days back to top-left cell (col=0, row=0):
    // col 15, row todayDow → days ago = 0
    // col 15, row 0 → days ago = todayDow
    // col 14, row 6 → days ago = todayDow + 1
    // col 0, row 0 → days ago = todayDow + 15*7

    for (let c = 0; c < COLS; c++) {
      const col: Cell[] = []
      for (let r = 0; r < ROWS; r++) {
        // How many days ago is this cell?
        const daysBack = (COLS - 1 - c) * 7 + (todayDow - r)
        if (daysBack < 0) {
          // Future cell
          col.push({ dateStr: '', goal: null, isFuture: true, isToday: false })
        } else {
          const date = daysAgo(daysBack)
          const ds = toDateStr(date)
          col.push({
            dateStr: ds,
            goal: goalMap.get(ds) ?? null,
            isFuture: false,
            isToday: ds === todayStr,
          })
        }
      }
      cols.push(col)
    }
    return cols
  }, [goalMap, todayDow, todayStr])

  // Month labels: for each column, find the month of the first non-future cell
  const monthLabels: (string | null)[] = useMemo(() => {
    return grid.map((col, ci) => {
      const firstCell = col.find((c) => !c.isFuture && c.dateStr)
      if (!firstCell) return null
      const month = parseInt(firstCell.dateStr.slice(5, 7), 10) - 1
      // Show month name only when it changes from the previous column
      if (ci === 0) return MONTHS[month]
      const prevFirst = grid[ci - 1].find((c) => !c.isFuture && c.dateStr)
      if (!prevFirst) return MONTHS[month]
      const prevMonth = parseInt(prevFirst.dateStr.slice(5, 7), 10) - 1
      return prevMonth !== month ? MONTHS[month] : null
    })
  }, [grid])

  // Summary stats
  const { totalSet, totalHit, longestStreak } = useMemo(() => {
    const allCells = grid.flat().filter((c) => !c.isFuture && c.dateStr && c.goal)
    const set = allCells.length
    const hit = allCells.filter((c) => c.goal?.completed).length

    // Compute longest streak from history
    let longest = 0
    let run = 0
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
    for (const g of sorted) {
      if (g.completed) {
        run++
        longest = Math.max(longest, run)
      } else {
        run = 0
      }
    }
    return { totalSet: set, totalHit: hit, longestStreak: longest }
  }, [grid, history])

  const hitRate = totalSet > 0 ? Math.round((totalHit / totalSet) * 100) : 0

  function cellColor(cell: Cell): string {
    if (cell.isFuture || !cell.dateStr) return 'transparent'
    if (cell.isToday && (!cell.goal || (cell.goal && !cell.goal.completed))) {
      return 'rgba(200,146,42,0.4)'
    }
    if (!cell.goal) return 'rgba(255,255,255,0.05)'
    if (!cell.goal.completed) return 'rgba(192,57,43,0.45)'
    // Hit: check if within last 30 days
    const daysBackFromToday = Math.round(
      (new Date(todayStr).getTime() - new Date(cell.dateStr).getTime()) / 86400000
    )
    const opacity = daysBackFromToday <= 30 ? 1 : 0.7
    return `rgba(42,184,126,${opacity})`
  }

  function isAnimated(cell: Cell): boolean {
    return cell.isToday && (!cell.goal || !cell.goal.completed)
  }

  function handleMouseEnter(cell: Cell, e: React.MouseEvent) {
    if (!cell.dateStr || cell.isFuture) return
    const date = new Date(cell.dateStr + 'T00:00:00')
    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    let status = 'No goal'
    let goalText = ''
    if (cell.isToday && cell.goal && !cell.goal.completed) {
      status = 'Active'
      goalText = cell.goal.mainGoal.slice(0, 40)
    } else if (cell.goal) {
      status = cell.goal.completed ? 'Hit' : 'Miss'
      goalText = cell.goal.mainGoal.slice(0, 40)
    }
    const text = goalText ? `${dateLabel} · ${status}\n${goalText}${cell.goal && cell.goal.mainGoal.length > 40 ? '…' : ''}` : `${dateLabel} · ${status}`
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  const CELL_SIZE = 12
  const GAP = 2

  return (
    <div>
      <style>{`
        @keyframes hinge-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hinge-pulse { animation: hinge-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Heatmap scroll container */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'inline-flex', gap: 0 }}>
          {/* Day labels column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginTop: 18, marginRight: GAP }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: CELL_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: 9,
                  color: 'rgba(245,242,234,0.35)',
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: GAP }}>
            {grid.map((col, ci) => (
              <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {/* Month label */}
                <div
                  style={{
                    height: 14,
                    fontSize: 9,
                    color: 'rgba(245,242,234,0.4)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                    lineHeight: '14px',
                  }}
                >
                  {monthLabels[ci] ?? ''}
                </div>

                {/* Day cells */}
                {col.map((cell, ri) => {
                  const color = cellColor(cell)
                  const animated = isAnimated(cell)
                  return (
                    <div
                      key={ri}
                      className={animated ? 'hinge-pulse' : ''}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: 3,
                        backgroundColor: color,
                        cursor: cell.dateStr && !cell.isFuture ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => handleMouseEnter(cell, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary line */}
      <p style={{ fontSize: 11, color: 'rgba(245,242,234,0.4)', marginTop: 8, lineHeight: 1.4 }}>
        {totalSet} goals set · {totalHit} hit · {hitRate}% hit rate · longest streak: {longestStreak}
      </p>

      {/* Tooltip (fixed position based on mouse) */}
      {tooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'rgba(20,19,17,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 11,
            color: 'rgba(245,242,234,0.9)',
            whiteSpace: 'pre-line',
            zIndex: 9999,
            pointerEvents: 'none',
            maxWidth: 200,
            lineHeight: 1.5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
