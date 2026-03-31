'use client'

import { useState, KeyboardEvent } from 'react'
import type { OverflowItem } from '@/lib/types'

interface OverflowLogProps {
  items: OverflowItem[]
  onAdd: (text: string) => void
  disabled?: boolean
}

export default function OverflowLog({ items, onAdd, disabled = false }: OverflowLogProps) {
  const [inputVisible, setInputVisible] = useState(false)
  const [value, setValue] = useState('')

  function handleAdd() {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
    setInputVisible(false)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setValue(''); setInputVisible(false) }
  }

  return (
    <div className="bg-bg-3 border border-[var(--border)] rounded-[12px] px-4 py-3.5 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-ink-3 font-medium">
          Happened today
        </span>
        <span className="text-[10px] text-ink-4 italic">
          Logged · not graded · won&apos;t carry over
        </span>
      </div>

      {items.map((item) => (
        <p key={item.id} className="text-[12px] text-ink-3 py-1.5 border-b border-[var(--border)] last:border-0">
          {item.text}
        </p>
      ))}

      {!disabled && (inputVisible ? (
        <div className="flex items-center gap-2 mt-1.5">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What happened..."
            className="flex-1 bg-bg-4 border border-[var(--border2)] text-ink text-[12px] rounded-[8px] px-3 py-1.5 outline-none focus:border-gold"
          />
          <button
            onClick={handleAdd}
            className="text-[11px] text-gold hover:text-gold-light transition-colors"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setInputVisible(true)}
          className="text-[11px] text-ink-4 italic hover:text-ink-3 transition-colors mt-1 block"
        >
          + Add to log
        </button>
      ))}
    </div>
  )
}
