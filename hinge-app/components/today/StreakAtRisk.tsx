'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { DailyGoal } from '@/lib/types'
import { getNotificationPrefs } from '@/lib/notifications'

interface Props {
  today: DailyGoal | null
}

function getMinutesUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 60_000)
}

function formatTimeRemaining(minutes: number): string {
  if (minutes <= 0) return 'less than a minute'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} hour${h === 1 ? '' : 's'}`
  return `${h}h ${m}m`
}

function isPastEveningTime(eveningTime: string): boolean {
  const now = new Date()
  const [h, m] = eveningTime.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const eveningMinutes = h * 60 + m
  return nowMinutes >= eveningMinutes
}

export default function StreakAtRisk({ today }: Props) {
  const [shouldShow, setShouldShow] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(getMinutesUntilMidnight())

  useEffect(() => {
    function check() {
      if (!today || today.completed) {
        setShouldShow(false)
        return
      }
      const prefs = getNotificationPrefs()
      const past = isPastEveningTime(prefs.eveningTime)
      setShouldShow(past)
      setMinutesLeft(getMinutesUntilMidnight())
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [today])

  if (!shouldShow) return null

  return (
    <div
      style={{
        background: 'rgba(200, 146, 42, 0.1)',
        border: '1px solid rgba(200, 146, 42, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ fontSize: '13px', color: '#c8922a', fontWeight: 600, marginBottom: '1px' }}>
            Streak at risk
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.55)', lineHeight: 1.4 }}>
            {minutesLeft > 0
              ? `${formatTimeRemaining(minutesLeft)} until midnight · close your day to keep the streak`
              : 'Midnight — close your day before it resets'}
          </p>
        </div>
      </div>
      <Link
        href="/snapshot"
        style={{
          background: '#c8922a',
          color: '#0f0e0c',
          borderRadius: '8px',
          padding: '7px 13px',
          fontSize: '12px',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'inline-block',
        }}
      >
        Close day →
      </Link>
    </div>
  )
}
