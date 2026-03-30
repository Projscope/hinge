type PillVariant = 'gold' | 'teal' | 'red' | 'neutral'

interface PillProps {
  variant?: PillVariant
  children: React.ReactNode
  className?: string
}

const styles: Record<PillVariant, string> = {
  gold: 'bg-[var(--gold-dim)] text-gold border border-[rgba(200,146,42,0.2)]',
  teal: 'bg-[rgba(26,122,101,0.2)] text-teal-bright',
  red: 'bg-[var(--red-dim)] text-[#e26b5e]',
  neutral: 'bg-[rgba(255,255,255,0.05)] text-ink-3 border border-[var(--border)]',
}

export default function Pill({ variant = 'neutral', children, className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-[9px] py-[2px] rounded-full ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
