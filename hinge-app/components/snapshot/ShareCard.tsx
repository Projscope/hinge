'use client'

interface ShareCardProps {
  streakCount: number
  onShare?: (target: string) => void
}

export default function ShareCard({ streakCount, onShare }: ShareCardProps) {
  const dots = Array.from({ length: 6 }, (_, i) => i < Math.min(streakCount % 7 || 7, 6))

  return (
    <div className="relative bg-gradient-to-br from-[#1a1915] to-[#252320] border border-[rgba(200,146,42,0.2)] rounded-[12px] p-4 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(200,146,42,0.15),transparent_70%)] pointer-events-none" />

      <p className="text-[9px] tracking-[0.12em] uppercase text-[rgba(200,146,42,0.4)] mb-1.5 font-mono">
        Hin.ge
      </p>
      <div className="flex items-baseline gap-2.5 mb-2.5">
        <span className="font-serif text-[28px] text-gold leading-none">{streakCount}</span>
        <span className="text-[14px] text-ink-2 font-medium">day streak 🔥</span>
      </div>

      <div className="flex gap-1 mb-2.5">
        {dots.map((hit, i) => (
          <div
            key={i}
            className={`w-[7px] h-[7px] rounded-full ${hit ? 'bg-gold' : 'bg-[rgba(255,255,255,0.1)]'}`}
          />
        ))}
      </div>

      <p className="text-[9px] text-[rgba(255,255,255,0.2)] mb-2">
        Next milestone: Day {streakCount < 7 ? 7 : streakCount < 30 ? 30 : streakCount < 100 ? 100 : 365}
      </p>

      <div className="flex gap-1.5">
        {(['𝕏 Share', 'in Post', '💬 Slack', '🔗 Copy'] as const).map((btn) => (
          <button
            key={btn}
            onClick={() => onShare?.(btn)}
            className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded-[6px] py-1.5 text-[10px] text-ink-3 hover:bg-[rgba(255,255,255,0.1)] hover:text-ink transition-all font-sans"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}
