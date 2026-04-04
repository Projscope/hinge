'use client'

import { useState, useEffect } from 'react'
import {
  getPublicProfile,
  setPublicProfile,
  updatePublicProfileVisibility,
  validateUsername,
  type PublicProfile,
} from '@/lib/publicProfile'

export default function PublicProfileSection() {
  const [profile, setProfileState] = useState<PublicProfile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [usernameError, setUsernameError] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = getPublicProfile()
    if (p) {
      setProfileState(p)
      setUsername(p.username)
      setDisplayName(p.displayName)
      setIsPublic(p.isPublic)
    }
  }, [])

  function handleSave() {
    setUsernameError('')
    const validation = validateUsername(username)
    if (!validation.valid) {
      setUsernameError(validation.error ?? 'Invalid username')
      return
    }
    const updated = setPublicProfile(username, displayName)
    // Apply visibility state
    updatePublicProfileVisibility(isPublic)
    setProfileState({ ...updated, isPublic })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleTogglePublic(v: boolean) {
    setIsPublic(v)
    if (profile) {
      updatePublicProfileVisibility(v)
      setProfileState({ ...profile, isPublic: v })
    }
  }

  async function handleCopy() {
    const url = `hin.ge/u/${profile?.username ?? username}`
    try {
      await navigator.clipboard.writeText(`https://${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable
    }
  }

  if (!mounted) return null

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '12px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '14px',
    color: '#f5f2ea',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const shareUrl = `hin.ge/u/${profile?.username ?? username}`

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Section label */}
      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(245,242,234,0.35)',
          marginBottom: '12px',
        }}
      >
        Public profile
      </p>

      <div style={cardStyle}>
        {/* Public toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div>
            <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500 }}>
              Make my streak page public
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)', marginTop: '2px' }}>
              Share your streak with anyone
            </p>
          </div>
          <button
            role="switch"
            aria-checked={isPublic}
            onClick={() => handleTogglePublic(!isPublic)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: isPublic ? '#c8922a' : 'rgba(255,255,255,0.1)',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: isPublic ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#f5f2ea',
                transition: 'left 0.2s',
                display: 'block',
              }}
            />
          </button>
        </div>

        {/* Username */}
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(245,242,234,0.4)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value.toLowerCase()); setUsernameError('') }}
            placeholder="your_username"
            style={{
              ...inputStyle,
              borderColor: usernameError ? 'rgba(192,59,43,0.5)' : 'rgba(255,255,255,0.1)',
            }}
          />
          {usernameError ? (
            <p style={{ fontSize: '11px', color: 'rgba(220,90,80,0.9)', marginTop: '4px' }}>
              {usernameError}
            </p>
          ) : (
            <p style={{ fontSize: '11px', color: 'rgba(245,242,234,0.3)', marginTop: '4px' }}>
              3–20 chars, letters/numbers/underscores
            </p>
          )}
        </div>

        {/* Display name */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(245,242,234,0.4)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            background: '#c8922a',
            color: '#0f0e0c',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Save profile
        </button>

        {saved && (
          <p style={{ fontSize: '12px', color: '#2ab87e', marginTop: '10px' }}>✓ Profile saved</p>
        )}

        {/* Shareable URL */}
        {profile && isPublic && username && (
          <div
            style={{
              marginTop: '16px',
              background: 'rgba(200,146,42,0.07)',
              border: '1px solid rgba(200,146,42,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: '#c8922a',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(42,184,126,0.15)' : 'rgba(200,146,42,0.15)',
                color: copied ? '#2ab87e' : '#c8922a',
                border: `1px solid ${copied ? 'rgba(42,184,126,0.3)' : 'rgba(200,146,42,0.3)'}`,
                borderRadius: '7px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
