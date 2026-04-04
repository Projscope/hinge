'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/today', icon: '◎', label: 'Today' },
  { href: '/setup', icon: '⊕', label: 'Setup' },
  { href: '/queue', icon: '☰', label: 'Queue' },
  { href: '/snapshot', icon: '◈', label: 'Snapshot' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden flex-shrink-0 bg-bg-2 border-t border-[var(--border)] flex">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 no-underline transition-colors
              ${active ? 'text-gold' : 'text-ink-3'}
            `}
          >
            <span className="text-[18px] leading-none">{item.icon}</span>
            <span className={`text-[9px] font-medium tracking-wide ${active ? 'text-gold' : 'text-ink-4'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
