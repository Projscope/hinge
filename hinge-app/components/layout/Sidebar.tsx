'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Streaks, Plan } from '@/lib/types'
import { FOCUS_RANKS } from '@/lib/types'

interface SidebarProps {
  streaks: Streaks
  plan: Plan
  hitRate: number
}

const NAV_ITEMS = [
  { href: '/today', icon: '⚡', label: 'Today', group: 'Daily' },
  { href: '/setup', icon: '🌅', label: 'Morning setup', group: 'Daily' },
  { href: '/snapshot', icon: '📊', label: 'Snapshot', group: 'Daily' },
  { href: '/history', icon: '📅', label: 'History', group: 'Progress' },
  { href: '/insights', icon: '📈', label: 'Insights', group: 'Progress' },
  { href: '/milestones', icon: '🏅', label: 'Milestones', group: 'Progress' },
]

function getRank(hitRate: number) {
  return FOCUS_RANKS.find((r) => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
}

export default function Sidebar({ streaks, plan, hitRate }: SidebarProps) {
  const pathname = usePathname()
  const rank = getRank(hitRate)
  const rankProgress = ((hitRate - rank.min) / ((rank.max === 100 ? 100 : rank.max + 1) - rank.min)) * 100

  return (
    <aside className="bg-bg-2 border-r border-[var(--border)] flex flex-col overflow-hidden h-full">
      {/* Logo */}
      <div className="px-5 py-[22px] border-b border-[var(--border)]">
        <Link href="/" className="no-underline">
          <p className="font-serif text-[22px] text-ink tracking-tight">
            Hin<span className="text-gold">.</span>ge
          </p>
          <p className="text-[11px] text-ink-3 mt-0.5">Stop managing. Start finishing.</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pt-1">
        {(['Daily', 'Progress'] as const).map((group) => (
          <div key={group} className="pt-3.5 pb-1.5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-ink-4 font-medium px-5 mb-1">
              {group}
            </p>
            {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 px-5 py-[9px] text-[13px] cursor-pointer
                    border-l-2 transition-all duration-150 no-underline
                    ${active
                      ? 'text-ink bg-[rgba(200,146,42,0.08)] border-gold'
                      : 'text-ink-3 border-transparent hover:text-ink-2 hover:bg-[rgba(255,255,255,0.03)]'
                    }
                  `}
                >
                  <span className="text-[14px] w-[18px] text-center flex-shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Rank widget */}
      <div
        className="mx-3.5 mb-2 bg-[var(--gold-dim)] border border-[rgba(200,146,42,0.2)] rounded-[12px] px-3.5 py-3 cursor-pointer hover:bg-[rgba(200,146,42,0.2)] transition-colors"
      >
        <p className="text-[9px] uppercase tracking-[0.1em] text-[rgba(200,146,42,0.6)] font-medium mb-0.5">
          Focus rank
        </p>
        <p className="font-serif text-[17px] text-gold">
          {rank.label} {rank.icon}
        </p>
        <p className="text-[10px] text-ink-3 mt-0.5">{hitRate}% hit rate · 30-day avg</p>
        <div className="h-[2px] bg-[rgba(255,255,255,0.08)] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, rankProgress)}%` }}
          />
        </div>
      </div>

      {/* Upgrade CTA — free only */}
      {plan === 'free' && (
        <div className="mx-3.5 mb-3.5 bg-gold rounded-[10px] px-3.5 py-2.5 cursor-pointer hover:opacity-90 transition-opacity">
          <p className="text-[9px] uppercase tracking-[0.08em] text-black/50 font-semibold mb-0.5">
            Free plan
          </p>
          <p className="text-[11px] text-black font-semibold">Upgrade to Pro →</p>
        </div>
      )}

      {/* Streak counter bottom */}
      <div className="px-5 pb-4 pt-1 flex items-center gap-2 border-t border-[var(--border)]">
        <span className="font-serif text-[20px] text-gold">{streaks.current}</span>
        <div>
          <p className="text-[11px] text-ink font-medium leading-none">day streak 🔥</p>
          <p className="text-[10px] text-ink-3 mt-0.5">Best: {plan === 'pro' ? streaks.personalBest : '??'}</p>
        </div>
      </div>
    </aside>
  )
}
