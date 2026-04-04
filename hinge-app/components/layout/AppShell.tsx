'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import BottomNav from '@/components/layout/BottomNav'
import { useAppStore } from '@/lib/store'
import { initNotifications } from '@/lib/notifications'
import { updatePublicSnapshot } from '@/lib/publicSnapshot'
import { getPublicProfile } from '@/lib/publicProfile'
import { FOCUS_RANKS } from '@/lib/types'

function calcHitRate(history: { completed: boolean }[]): number {
  if (history.length === 0) return 0
  const hits = history.filter((g) => g.completed).length
  return Math.round((hits / history.length) * 100)
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { streaks, history, today, plan, hydrated } = useAppStore()
  const hitRate = calcHitRate(history.slice(0, 30))

  useEffect(() => {
    initNotifications()
  }, [])

  // Keep public snapshot in sync whenever streaks or history change
  useEffect(() => {
    if (!hydrated) return
    const profile = getPublicProfile()
    if (!profile) return

    const recent30 = history.slice(0, 30)
    const rate = calcHitRate(recent30)

    // Compute rank
    let rank: typeof FOCUS_RANKS[number] = FOCUS_RANKS[0]
    for (let i = FOCUS_RANKS.length - 1; i >= 0; i--) {
      if (rate >= FOCUS_RANKS[i].min) {
        rank = FOCUS_RANKS[i]
        break
      }
    }

    // Build last14 array
    const today14 = new Date().toISOString().slice(0, 10)
    const last14 = Array.from({ length: 14 }, (_, idx): 'hit' | 'miss' | 'none' => {
      const d = new Date(today14)
      d.setDate(d.getDate() - idx)
      const dateStr = d.toISOString().slice(0, 10)
      const entry = history.find((g) => g.date === dateStr)
      if (!entry) return 'none'
      return entry.completed ? 'hit' : 'miss'
    })

    updatePublicSnapshot({
      streakCurrent: streaks.current,
      streakPersonalBest: streaks.personalBest,
      hitRate30: rate,
      rankLabel: rank.label,
      rankIcon: rank.icon,
      last14,
      displayName: profile.displayName,
      username: profile.username,
      updatedAt: new Date().toISOString(),
    })
  }, [streaks, history, hydrated])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-ink-3 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="w-full h-[100dvh] bg-bg overflow-hidden flex flex-col">
      {/* Browser chrome bar — desktop only */}
      <div className="hidden lg:flex h-[34px] bg-[#1a1915] items-center px-3.5 gap-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex gap-[5px]">
          <div className="w-[11px] h-[11px] rounded-full bg-[#e05b5b]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#e0b85b]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#5be07d]" />
        </div>
        <div className="flex-1 bg-[rgba(255,255,255,0.04)] rounded-[6px] px-3 py-[3px] text-[11px] text-ink-3 max-w-[340px] mx-auto font-mono">
          hin.ge/today
        </div>
      </div>

      {/* App grid (desktop) / single column (mobile) */}
      <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-app">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:contents">
          <Sidebar streaks={streaks} plan={plan} hitRate={hitRate} />
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto bg-bg app-scroll animate-fadeUp">
          {children}
        </main>

        {/* Right panel — desktop only */}
        <div className="hidden lg:contents">
          <RightPanel streaks={streaks} history={history} today={today} plan={plan} hitRate={hitRate} />
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
