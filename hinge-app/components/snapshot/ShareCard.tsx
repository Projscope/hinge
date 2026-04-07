'use client'

import { useState } from 'react'

interface ShareCardProps {
  streakCount: number
  username?: string | null
}

export default function ShareCard({ streakCount, username }: ShareCardProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = username
    ? `https://myhinge.app/share/${username}?v=2`
    : 'https://myhinge.app'

  const tweetText = `I'm on a ${streakCount}-day streak on myhinge 🔥\nOne goal. Every day. No excuses.\n`

  async function handleTwitter() {
    setLoading(true)
    try {
      // Pre-generate and upload the OG image to Supabase Storage before opening Twitter
      if (username) {
        await fetch('/api/og/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        })
      }
    } catch {
      // Non-fatal — open Twitter anyway
    }
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setLoading(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
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

      {username && (
        <p className="text-[9px] text-[rgba(255,255,255,0.18)] mt-2 text-center truncate">
          myhinge.app/share/{username}?v=2
        </p>
      )}
    </div>
  )
}
