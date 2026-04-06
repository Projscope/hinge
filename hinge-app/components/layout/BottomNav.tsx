'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/today',      icon: '◎',  label: 'Today' },
  { href: '/setup',      icon: '⊕',  label: 'Setup' },
  { href: '/queue',      icon: '☰',  label: 'Queue' },
  { href: '/progress',   icon: '📊', label: 'Progress' },
  { href: '/settings',   icon: '⚙',  label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <nav className="lg:hidden flex-shrink-0 bg-bg-2 border-t border-[var(--border)]">
        <div className="flex w-full">
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

          {/* Logout button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-ink-3 hover:text-ink-2 transition-colors"
          >
            <span className="text-[18px] leading-none">↪</span>
            <span className="text-[9px] font-medium tracking-wide text-ink-4">Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-2 border border-[var(--border)] rounded-[16px] p-6 w-[280px] shadow-xl">
            <p className="font-serif text-[20px] text-ink mb-2">Log out?</p>
            <p className="text-[13px] text-ink-3 mb-6 leading-relaxed">
              Your streak and goals are safely stored. You can log back in anytime.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-ink-2 text-[13px] font-medium py-2.5 rounded-[10px] transition-colors border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-[rgba(192,57,43,0.15)] hover:bg-[rgba(192,57,43,0.25)] text-[#e26b5e] text-[13px] font-medium py-2.5 rounded-[10px] transition-colors border border-[rgba(192,57,43,0.25)]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
