'use client'

import { useState, useEffect } from 'react'
import { getWeeklyAnchor, setWeeklyAnchor } from '@/lib/weeklyAnchor'
import type { WeeklyAnchor } from '@/lib/weeklyAnchor'

export default function WeeklyAnchorBanner() {
  const [anchor, setAnchor] = useState<WeeklyAnchor | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getWeeklyAnchor().then((loaded) => {
      setAnchor(loaded)
    })
  }, [])

  if (!mounted) return null

  function handleEdit() {
    setDraft(anchor?.text ?? '')
    setEditing(true)
  }

  async function handleSave() {
    const text = draft.trim()
    if (!text) return
    const saved = await setWeeklyAnchor(text)
    setAnchor(saved)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div
        style={{
          background: 'rgba(200, 146, 42, 0.08)',
          border: '1px solid rgba(200, 146, 42, 0.25)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(200,146,42,0.7)',
            marginBottom: '8px',
            fontWeight: 500,
          }}
        >
          This week&apos;s anchor
        </p>
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What does a great week look like?"
          rows={2}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(200,146,42,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            color: '#f5f2ea',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            style={{
              background: draft.trim() ? '#c8922a' : 'rgba(200,146,42,0.2)',
              color: draft.trim() ? '#0f0e0c' : 'rgba(200,146,42,0.5)',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            style={{
              background: 'transparent',
              color: 'rgba(245,242,234,0.4)',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (!anchor) {
    return (
      <button
        onClick={handleEdit}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'rgba(200, 146, 42, 0.05)',
          border: '1px dashed rgba(200, 146, 42, 0.2)',
          borderRadius: '12px',
          padding: '10px 16px',
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px', color: 'rgba(200,146,42,0.6)' }}>◎</span>
        <span style={{ fontSize: '12px', color: 'rgba(200,146,42,0.7)' }}>
          Set this week&apos;s anchor →
        </span>
      </button>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(200, 146, 42, 0.07)',
        border: '1px solid rgba(200, 146, 42, 0.18)',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '13px', color: '#c8922a', flexShrink: 0, marginTop: '1px' }}>◎</span>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(200,146,42,0.6)',
              marginBottom: '2px',
              fontWeight: 500,
            }}
          >
            This week
          </p>
          <p
            style={{
              fontSize: '13px',
              color: '#c8922a',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {anchor.text}
          </p>
        </div>
      </div>
      <button
        onClick={handleEdit}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(200,146,42,0.5)',
          fontSize: '11px',
          cursor: 'pointer',
          padding: '2px 4px',
          flexShrink: 0,
        }}
      >
        edit
      </button>
    </div>
  )
}
