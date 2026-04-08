'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhinge.app'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // On success the browser navigates to Google — no cleanup needed
  }

  return (
    <div className="w-full max-w-[380px]">
      {/* Logo */}
      <div className="text-center mb-10">
        <Link href="/" className="no-underline">
          <p className="font-serif text-[32px] text-ink tracking-tight">
            my<span className="text-gold">hinge</span>
          </p>
        </Link>
        <p className="text-[13px] text-ink-3 mt-1">Stop managing. Start finishing.</p>
      </div>

      {sent ? (
        <div className="bg-bg-3 border border-[var(--border)] rounded-[16px] p-8 text-center">
          <p className="text-[36px] mb-4">📬</p>
          <p className="font-serif text-[22px] text-ink mb-2">Check your inbox</p>
          <p className="text-[13px] text-ink-3 leading-relaxed">
            We sent a magic link to <strong className="text-ink">{email}</strong>.
            Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-[12px] text-ink-3 hover:text-ink transition-colors"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <div className="bg-bg-3 border border-[var(--border)] rounded-[16px] p-8">
          <p className="font-serif text-[22px] text-ink mb-1">Sign in</p>
          <p className="text-[13px] text-ink-3 mb-6">
            Choose how you&apos;d like to continue.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="
              w-full flex items-center justify-center gap-3
              bg-white text-[#1a1a1a] text-[14px] font-medium
              border border-[rgba(0,0,0,0.12)] rounded-[10px] py-3
              hover:bg-[#f7f7f7] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed mb-4
            "
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11px] text-ink-4">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Magic link */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full bg-bg-4 border border-[var(--border2)] text-ink text-[14px]
                rounded-[10px] px-4 py-3 outline-none
                focus:border-gold placeholder:text-ink-4
                transition-colors
              "
            />

            {error && (
              <p className="text-[12px] text-[#e26b5e]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="
                w-full bg-gold text-black text-[14px] font-semibold
                py-3 rounded-[10px] transition-opacity
                hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Sending…' : 'Send magic link →'}
            </button>
          </form>

          <p className="text-[11px] text-ink-4 text-center mt-5 leading-relaxed">
            Free forever · No card required<br />
            By signing in you agree to our terms.
          </p>
        </div>
      )}
    </div>
  )
}
