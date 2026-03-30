interface CardProps {
  children: React.ReactNode
  className?: string
  gold?: boolean
}

export default function Card({ children, className = '', gold = false }: CardProps) {
  return (
    <div
      className={`
        bg-bg-3 border rounded-[14px] p-4
        ${gold
          ? 'border-[rgba(200,146,42,0.3)] bg-[var(--gold-dim)]'
          : 'border-[var(--border)]'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
