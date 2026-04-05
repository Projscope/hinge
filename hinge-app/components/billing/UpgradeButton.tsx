'use client'

import { useState } from 'react'

interface UpgradeButtonProps {
  interval?: 'month' | 'year'
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function UpgradeButton({ interval = 'month', className, style, children }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading} className={className} style={style}>
      {loading ? 'Redirecting…' : (children ?? 'Upgrade to Pro')}
    </button>
  )
}
