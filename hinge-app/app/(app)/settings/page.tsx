'use client'

import { useState, useEffect } from 'react'
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  requestNotificationPermission,
  type NotificationPrefs,
} from '@/lib/notifications'

function PermissionBadge({ permission }: { permission: string }) {
  const map: Record<string, { label: string; color: string }> = {
    granted:     { label: 'Allowed',     color: '#2ab87e' },
    denied:      { label: 'Blocked',     color: '#c03b2b' },
    default:     { label: 'Not asked',   color: 'rgba(245,242,234,0.4)' },
    unsupported: { label: 'Unsupported', color: 'rgba(245,242,234,0.4)' },
  }
  const entry = map[permission] ?? map['default']
  return (
    <span style={{ fontSize: '12px', color: entry.color, fontWeight: 500 }}>
      {entry.label}
    </span>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? '#c8922a' : 'rgba(255,255,255,0.1)',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#f5f2ea',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </button>
  )
}

interface TimeInputProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

function TimeInput({ value, onChange, disabled }: TimeInputProps) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '14px',
        color: disabled ? 'rgba(245,242,234,0.35)' : '#f5f2ea',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        colorScheme: 'dark',
      }}
    />
  )
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    morningEnabled: false,
    morningTime: '08:00',
    eveningEnabled: false,
    eveningTime: '20:00',
  })
  const [permission, setPermission] = useState<string>('default')
  const [requesting, setRequesting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPrefs(getNotificationPrefs())
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    } else {
      setPermission('unsupported')
    }
  }, [])

  function updatePrefs(patch: Partial<NotificationPrefs>) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    saveNotificationPrefs(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  async function handleRequestPermission() {
    setRequesting(true)
    const granted = await requestNotificationPermission()
    setPermission(granted ? 'granted' : 'denied')
    if (granted && (prefs.morningEnabled || prefs.eveningEnabled)) {
      saveNotificationPrefs(prefs)
    }
    setRequesting(false)
  }

  const canToggle = permission === 'granted'

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-7 mb-6">
        <h1 className="font-serif text-[26px] text-ink leading-tight">Settings</h1>
        <p className="text-[12px] text-ink-3 mt-0.5">Notifications &amp; preferences</p>
      </div>

      <div className="px-8 pb-8 max-w-[520px]">
        {/* Permission status card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.7)', fontWeight: 500 }}>
              Browser notification permission
            </p>
            <PermissionBadge permission={permission} />
          </div>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              onClick={handleRequestPermission}
              disabled={requesting || permission === 'denied'}
              style={{
                background: permission === 'denied' ? 'rgba(200,146,42,0.15)' : '#c8922a',
                color: permission === 'denied' ? 'rgba(200,146,42,0.5)' : '#0f0e0c',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (requesting || permission === 'denied') ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {requesting
                ? 'Requesting…'
                : permission === 'denied'
                ? 'Blocked by browser — update in site settings'
                : 'Enable notifications'}
            </button>
          )}
          {permission === 'denied' && (
            <p style={{ fontSize: '11px', color: 'rgba(245,242,234,0.35)', marginTop: '8px', lineHeight: 1.5 }}>
              To unblock, open your browser&apos;s site settings and allow notifications for this site.
            </p>
          )}
          {permission === 'unsupported' && (
            <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.4)', lineHeight: 1.5 }}>
              Your browser does not support notifications.
            </p>
          )}
        </div>

        {/* Morning notification */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500 }}>Morning reminder</p>
              <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)', marginTop: '2px' }}>
                Daily prompt to set your goal
              </p>
            </div>
            <Toggle
              checked={prefs.morningEnabled}
              onChange={(v) => updatePrefs({ morningEnabled: v })}
              disabled={!canToggle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(245,242,234,0.5)' }}>Time</span>
            <TimeInput
              value={prefs.morningTime}
              onChange={(v) => updatePrefs({ morningTime: v })}
              disabled={!prefs.morningEnabled || !canToggle}
            />
          </div>
        </div>

        {/* Evening notification */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500 }}>Evening reminder</p>
              <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)', marginTop: '2px' }}>
                Prompt to close your day
              </p>
            </div>
            <Toggle
              checked={prefs.eveningEnabled}
              onChange={(v) => updatePrefs({ eveningEnabled: v })}
              disabled={!canToggle}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(245,242,234,0.5)' }}>Time</span>
            <TimeInput
              value={prefs.eveningTime}
              onChange={(v) => updatePrefs({ eveningTime: v })}
              disabled={!prefs.eveningEnabled || !canToggle}
            />
          </div>
        </div>

        {/* Save feedback */}
        {saved && (
          <p style={{ fontSize: '12px', color: '#2ab87e', textAlign: 'center', marginBottom: '12px' }}>
            ✓ Preferences saved
          </p>
        )}

        {!canToggle && permission !== 'unsupported' && (
          <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.35)', textAlign: 'center', lineHeight: 1.6 }}>
            Enable browser notifications above to turn on reminders.
          </p>
        )}
      </div>
    </div>
  )
}
