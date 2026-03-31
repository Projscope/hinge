'use client'

import { TextareaHTMLAttributes } from 'react'
import { scoreGoalQuality } from '@/lib/goalQuality'

interface GoalInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string
  onChange: (val: string) => void
  showQuality?: boolean
}

export default function GoalInput({ value, onChange, showQuality = false, ...props }: GoalInputProps) {
  const quality = showQuality ? scoreGoalQuality(value) : null

  const borderColor =
    quality?.status === 'ok'
      ? 'border-teal-bright focus:border-teal-bright'
      : quality?.status === 'warn' && value.length > 5
      ? 'border-amber focus:border-amber'
      : 'border-[var(--border2)] focus:border-gold'

  const barColor =
    quality?.status === 'ok' ? 'bg-teal-bright' : 'bg-amber'

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={`
          w-full px-4 py-3 text-[15px] font-sans text-ink
          bg-bg-4 border-[1.5px] rounded-[12px] outline-none
          transition-colors duration-200 resize-none
          placeholder:text-ink-4
          ${borderColor}
        `}
        {...props}
      />
      {showQuality && value.length > 3 && quality && (
        <>
          <div className="h-[3px] bg-[rgba(255,255,255,0.07)] rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${quality.score}%` }}
            />
          </div>
          <div
            className={`
              inline-flex items-center gap-1.5 text-[11px] font-medium
              px-2.5 py-1 rounded-full mt-1.5
              ${quality.status === 'ok'
                ? 'bg-[rgba(26,122,101,0.2)] text-teal-bright'
                : 'bg-[rgba(217,119,6,0.2)] text-amber'}
            `}
          >
            {quality.label} — {quality.feedback}
          </div>
        </>
      )}
    </div>
  )
}
