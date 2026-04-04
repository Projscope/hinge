'use client'

import { useState, useEffect } from 'react'
import { loadQueue, addToQueue, removeFromQueue } from '@/lib/goalQueue'
import type { QueueItem } from '@/lib/goalQueue'
import { AREA_TAGS } from '@/lib/types'
import type { AreaTag } from '@/lib/types'

const AREA_COLORS: Record<AreaTag, string> = {
  work: '#c8922a',
  home: '#3b9fd4',
  family: '#7c6df5',
  health: '#2ab87e',
  personal: '#888888',
}

const AREA_ORDER: AreaTag[] = ['work', 'home', 'family', 'health', 'personal']

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [newText, setNewText] = useState('')
  const [newArea, setNewArea] = useState<AreaTag>('work')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadQueue().then((q) => {
      setItems(q)
      setLoading(false)
    })
  }, [])

  async function handleAdd() {
    const text = newText.trim()
    if (!text || saving) return
    setSaving(true)
    const item = await addToQueue(text, newArea)
    if (item) setItems((prev) => [...prev, item])
    setNewText('')
    setSaving(false)
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await removeFromQueue(id)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  if (!mounted || loading) {
    return (
      <div className="px-8 pt-7">
        <div className="h-8 w-32 bg-bg-3 rounded animate-pulse mb-4" />
        <div className="h-4 w-48 bg-bg-3 rounded animate-pulse mb-8" />
        <div className="h-24 bg-bg-3 rounded-[14px] animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="px-8 pt-7 pb-0 mb-5">
        <h1 className="font-serif text-[26px] text-ink leading-tight">Goal Queue</h1>
        <p className="text-[12px] text-ink-3 mt-0.5">
          Backlog of goals by area · pulled into setup each morning
        </p>
      </div>

      <div className="px-4 sm:px-8 pb-8 max-w-[620px]">
        {/* Add goal input */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '28px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(245,242,234,0.4)',
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            Add to queue
          </p>
          {/* Area selector */}
          <select
            value={newArea}
            onChange={(e) => setNewArea(e.target.value as AreaTag)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '13px',
              color: AREA_COLORS[newArea],
              outline: 'none',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            {AREA_ORDER.map((area) => (
              <option key={area} value={area} style={{ color: AREA_COLORS[area], background: '#1a1814' }}>
                {AREA_TAGS[area].icon} {AREA_TAGS[area].label}
              </option>
            ))}
          </select>
          {/* Text input + Add button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's a goal you want to tackle?"
              style={{
                flex: 1,
                minWidth: 0,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#f5f2ea',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAdd}
              disabled={!newText.trim() || saving}
              style={{
                background: newText.trim() && !saving ? '#c8922a' : 'rgba(200,146,42,0.2)',
                color: newText.trim() && !saving ? '#0f0e0c' : 'rgba(200,146,42,0.5)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: newText.trim() && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {saving ? '…' : 'Add'}
            </button>
          </div>
        </div>

        {/* Area sections */}
        {AREA_ORDER.map((area) => {
          const areaItems = items.filter((item) => item.areaTag === area)
          const color = AREA_COLORS[area]
          const { label, icon } = AREA_TAGS[area]

          return (
            <div key={area} style={{ marginBottom: '24px' }}>
              {/* Area header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: `1px solid ${color}30`,
                }}
              >
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color,
                    letterSpacing: '0.03em',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(245,242,234,0.3)',
                    marginLeft: '2px',
                  }}
                >
                  {areaItems.length > 0 ? `${areaItems.length} queued` : ''}
                </span>
              </div>

              {/* Items */}
              {areaItems.length === 0 ? (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(245,242,234,0.25)',
                    fontStyle: 'italic',
                    paddingLeft: '4px',
                  }}
                >
                  Nothing queued for {label.toLowerCase()}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {areaItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: '13px',
                          color: '#f5f2ea',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(245,242,234,0.25)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '0 2px',
                          lineHeight: 1,
                          flexShrink: 0,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,242,234,0.7)'
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,242,234,0.25)'
                        }}
                        title="Remove from queue"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {items.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'rgba(245,242,234,0.25)',
            }}
          >
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>☰</p>
            <p style={{ fontSize: '14px' }}>Your queue is empty.</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>
              Add goals above or capture them after completing a daily goal.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
