'use client'

import { useState } from 'react'

interface ShareCardProps {
  streakCount: number
  username?: string | null
}

export default function ShareCard({ streakCount, username }: ShareCardProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState(false)

  const sharePageUrl = `https://myhinge.app${username ? `/share/${username}` : ''}`
  const tweetText = `I'm on a ${streakCount}-day streak on myhinge 🔥\nOne goal. Every day. No excuses.\n#myhinge`

  async function handleTwitter() {
    setLoading(true)

    if (username) {
      try {
        const res = await fetch('/api/og/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        })
        const data = await res.json()

        // Download the PNG via our same-origin proxy so the browser honours the
        // `download` attribute. Direct Supabase CDN URL fails CORS in the browser.
        if (data?.url) {
          try {
            const proxyUrl = `/api/og/download?u=${encodeURIComponent(username)}`
            const a = document.createElement('a')
            a.href = proxyUrl
            a.download = `my-streak-${streakCount}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setHint(true)
            setTimeout(() => setHint(false), 8000)
          } catch {
            // Download failed — still open Twitter
          }
        }
      } catch {
        // Non-fatal — open Twitter anyway without image
      }
    }

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setLoading(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sharePageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-[#1a1915] to-[#252320] border border-[rgba(200,146,42,0.2)] rounded-[12px] p-4 overflow-hidden">
      <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.15),transparent_70%)] pointer-events-none" />

      <p className="text-[9px] tracking-[0.12em] uppercase text-[rgba(200,146,42,0.4)] mb-1.5 font-mono">
        myhinge
      </p>
      <div className="flex items-baseline gap-2.5 mb-2.5">
        <span className="font-serif text-[28px] text-gold leading-none">{streakCount}</span>
        <span className="text-[14px] text-ink-2 font-medium">day streak 🔥</span>
      </div>

      <div className="flex gap-1 mb-2.5">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={`w-[7px] h-[7px] rounded-full ${i < (streakCount % 7 || 7) ? 'bg-gold' : 'bg-[rgba(255,255,255,0.1)]'}`} />
        ))}
      </div>

      <p className="text-[9px] text-[rgba(255,255,255,0.2)] mb-3">
        Next milestone: Day {streakCount < 7 ? 7 : streakCount < 30 ? 30 : streakCount < 100 ? 100 : 365}
      </p>

      <div className="flex gap-1.5">
        <button
          onClick={handleTwitter}
          disabled={loading}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded-[6px] py-1.5 text-[10px] text-ink-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-ink transition-all font-sans disabled:opacity-50"
        >
          {loading ? '…' : '𝕏 Share'}
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded-[6px] py-1.5 text-[10px] text-ink-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-ink transition-all font-sans"
        >
          {copied ? '✓ Copied' : '🔗 Copy'}
        </button>
      </div>

      {hint && (
        <p className="text-[9px] text-amber-400 mt-2 text-center leading-relaxed">
          📎 Image downloaded — attach it to your tweet
        </p>
      )}
      {!hint && (
        <p className="text-[9px] text-[rgba(255,255,255,0.18)] mt-2 text-center truncate">
          {username ? `myhinge.app/share/${username}` : 'myhinge.app'}
        </p>
      )}
    </div>
  )
}
