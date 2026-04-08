'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Variant = 'nav' | 'hero' | 'pricing-free' | 'pricing-pro' | 'pricing-yearly'

interface Props {
  variant: Variant
}

export default function LandingCTA({ variant }: Props) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(!!data.session))
  }, [])

  // While checking, render the guest version to avoid layout shift
  const isGuest = loggedIn === false || loggedIn === null

  if (variant === 'nav') {
    return isGuest ? (
      <Link
        href="/today"
        className="text-[13px] font-medium bg-[var(--lk-ink)] text-cream px-[18px] py-2 rounded-[6px] no-underline hover:opacity-85 transition-opacity"
      >
        Start free →
      </Link>
    ) : (
      <Link
        href="/today"
        className="text-[13px] font-medium bg-gold text-white px-[18px] py-2 rounded-[6px] no-underline hover:opacity-85 transition-opacity"
      >
        Open app →
      </Link>
    )
  }

  if (variant === 'hero') {
    return isGuest ? (
      <>
        <Link
          href="/setup"
          className="inline-flex items-center gap-2 bg-[var(--lk-ink)] text-cream px-7 py-[14px] rounded-[8px] text-[15px] font-medium no-underline hover:opacity-85 transition-opacity"
        >
          Start for free <span>→</span>
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-sm text-[var(--lk-muted)] hover:text-[var(--lk-ink)] no-underline border-b border-[var(--lk-border)] pb-px transition-colors"
        >
          See how it works ↓
        </a>
      </>
    ) : (
      <Link
        href="/today"
        className="inline-flex items-center gap-2 bg-gold text-white px-7 py-[14px] rounded-[8px] text-[15px] font-semibold no-underline hover:opacity-90 transition-opacity"
      >
        Continue your streak →
      </Link>
    )
  }

  if (variant === 'pricing-free') {
    return (
      <Link
        href="/today"
        className="mt-8 block text-center py-3 rounded-[8px] border border-[var(--lk-border)] text-[14px] font-medium text-[var(--lk-muted)] no-underline hover:border-[var(--lk-muted)] hover:text-[var(--lk-ink)] transition-colors"
      >
        {isGuest ? 'Start free' : 'Open app →'}
      </Link>
    )
  }

  if (variant === 'pricing-pro') {
    return (
      <Link
        href="/today"
        className="mt-8 block text-center py-3 rounded-[8px] bg-[var(--lk-ink)] text-cream text-[14px] font-medium no-underline hover:opacity-85 transition-opacity"
      >
        {isGuest ? 'Get started →' : 'Open app →'}
      </Link>
    )
  }

  // pricing-yearly
  return (
    <Link
      href="/today"
      className="mt-8 block text-center py-3 rounded-[8px] bg-gold text-black text-[14px] font-semibold no-underline hover:opacity-90 transition-opacity"
    >
      {isGuest ? 'Get started →' : 'Open app →'}
    </Link>
  )
}
