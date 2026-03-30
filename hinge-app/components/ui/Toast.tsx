'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setLeaving(true), 2200)
    const hide = setTimeout(() => onDone(), 2500)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [onDone])

  return (
    <div
      className={`
        fixed bottom-5 left-1/2 -translate-x-1/2 z-[999]
        bg-bg-4 border border-[var(--border2)] text-ink
        px-5 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap
        pointer-events-none
        ${leaving ? 'animate-toastOut' : 'animate-toastIn'}
      `}
    >
      {message}
    </div>
  )
}
