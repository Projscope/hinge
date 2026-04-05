'use client'

import { useState, useEffect } from 'react'
import {
  getPublicProfile,
  savePublicProfile,
  validateUsername,
  type PublicProfile,
} from '@/lib/publicProfile'

export default function PublicProfileSection() {
  const [profile, setProfileState] = useState<PublicProfile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [usernameError, setUsernameError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getPublicProfile().then((p) => {
      if (p) {
        setProfileState(p)
        setUsername(p.username)
        setDisplayName(p.displayName)
        setIsPublic(p.isPublic)
      }
    })
  }, [])

  async function handleSave() {
    setUsernameError('')
    setSaveError('')
    const validation = validateUsername(username)
    if (!validation.valid) {
      setUsernameError(validation.error ?? 'Invalid username')
      return
    }
    setSaving(true)
    const result = await savePublicProfile(username, displayName, isPublic)
    setSaving(false)
    if (!result.success) {
      setSaveError(result.error ?? 'Failed to save')
      return
    }
    const updated: PublicProfile = {
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      isPublic,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    }
    setProfileState(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTogglePublic(v: boolean) {
    setIsPublic(v)
    if (profile && username) {
      await savePublicProfile(username, displayName, v)
      setProfileState({ ...profile, isPublic: v })
    }
  }

  async function handleCopy() {
    const url = `https://myhinge.app/u/${profile?.username ?? username}`
    try {
      await navigator.clipboard.writeText(url)
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

  const savedHandle = profile?.username ?? ''
  const previewHandle = username.trim().toLowerCase()
  const shareUsername = savedHandle || previewHandle

  return (
    <div style={{ marginTop: '28px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,242,234,0.35)', marginBottom: '12px' }}>
        Public profile
      </p>

      <div style={cardStyle}>
        {/* Public toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500 }}>Make my streak page public</p>
            <p style={{ fontSize: '12px', color: 'rgba(245,242,234,0.45)', marginTop: '2px' }}>Anyone with the link can view your progress</p>
          </div>
          <button
            role="switch"
            aria-checked={isPublic}
            onClick={() => handleTogglePublic(!isPublic)}
            style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: isPublic ? '#c8922a' : 'rgba(255,255,255,0.1)',
              border: 'none', position: 'relative', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: isPublic ? '23px' : '3px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#f5f2ea', transition: 'left 0.2s', display: 'block',
            }} />
          </button>
        </div>

        {/* Profile URL handle */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(245,242,234,0.4)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Profile URL handle
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value.toLowerCase()); setUsernameError('') }}
            placeholder="your_handle"
            style={{ ...inputStyle, borderColor: usernameError ? 'rgba(192,59,43,0.5)' : 'rgba(255,255,255,0.1)' }}
          />
          {/* Live URL preview */}
          <p style={{ fontSize: '12px', color: previewHandle ? '#c8922a' : 'rgba(245,242,234,0.2)', marginTop: '5px', fontFamily: 'monospace' }}>
            myhinge.app/u/{previewHandle || 'your_handle'}
          </p>
          {usernameError && (
            <p style={{ fontSize: '11px', color: 'rgba(220,90,80,0.9)', marginTop: '3px' }}>{usernameError}</p>
          )}
        </div>

        {/* Display name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(245,242,234,0.4)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your name on the page
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
          <p style={{ fontSize: '11px', color: 'rgba(245,242,234,0.3)', marginTop: '4px' }}>
            Shown as your name on your public profile
          </p>
        </div>

        {/* Shareable URL — shown prominently if profile is saved and public */}
        {isPublic && shareUsername && (
          <div style={{ marginBottom: '16px', background: 'rgba(200,146,42,0.07)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(245,242,234,0.3)', marginBottom: '8px', fontWeight: 500 }}>
              Your public streak page
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <a
                href={`/u/${shareUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#c8922a', fontFamily: 'monospace', wordBreak: 'break-all', textDecoration: 'none', flex: 1 }}
              >
                myhinge.app/u/{shareUsername}
              </a>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <a
                  href={`/u/${shareUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: 'rgba(200,146,42,0.15)', color: '#c8922a', border: '1px solid rgba(200,146,42,0.3)', borderRadius: '7px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
                >
                  Open ↗
                </a>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'rgba(42,184,126,0.15)' : 'rgba(200,146,42,0.15)',
                    color: copied ? '#2ab87e' : '#c8922a',
                    border: `1px solid ${copied ? 'rgba(42,184,126,0.3)' : 'rgba(200,146,42,0.3)'}`,
                    borderRadius: '7px', padding: '5px 10px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? 'rgba(200,146,42,0.4)' : '#c8922a',
            color: '#0f0e0c', border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '13px', fontWeight: 600,
            cursor: saving ? 'default' : 'pointer', width: '100%', transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save profile'}
        </button>

        {saveError && <p style={{ fontSize: '12px', color: 'rgba(220,90,80,0.9)', marginTop: '10px' }}>{saveError}</p>}
      </div>
    </div>
  )
}
