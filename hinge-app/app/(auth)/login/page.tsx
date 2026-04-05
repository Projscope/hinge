'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
            We&apos;ll email you a magic link — no password required.
          </p>

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
