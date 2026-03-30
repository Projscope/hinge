'use client'

interface TaskCardProps {
  label: string
  text: string
  done: boolean
  onToggle: () => void
}

export default function TaskCard({ label, text, done, onToggle }: TaskCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        flex items-start gap-3 px-4 py-3.5 mb-2
        bg-bg-3 border rounded-[12px] cursor-pointer
        transition-all duration-150
        hover:border-[var(--border2)] hover:bg-bg-4
        ${done ? 'opacity-50' : ''}
      `}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Checkbox */}
      <div
        className={`
          w-[22px] h-[22px] rounded-full flex-shrink-0 mt-0.5
          flex items-center justify-center text-[11px]
          transition-all duration-200
          ${done
            ? 'bg-teal-bright border-teal-bright text-white'
            : 'border-[1.5px] border-ink-4'
          }
        `}
      >
        {done && '✓'}
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-[9px] uppercase tracking-[0.07em] text-ink-3 font-medium mb-0.5">
          {label}
        </p>
        <p className={`text-[14px] text-ink leading-snug ${done ? 'line-through text-ink-3' : ''}`}>
          {text}
        </p>
      </div>

      {/* Tag */}
      <span
        className={`
          text-[10px] font-medium px-[9px] py-[3px] rounded-full whitespace-nowrap self-start mt-0.5
          ${done
            ? 'bg-[rgba(26,122,101,0.2)] text-teal-bright'
            : 'bg-[var(--gold-dim)] text-gold'
          }
        `}
      >
        {done ? 'Done ✓' : 'Next up'}
      </span>
    </div>
  )
}
