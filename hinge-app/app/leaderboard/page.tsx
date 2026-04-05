'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FOCUS_RANKS } from '@/lib/types'

interface LeaderboardEntry {
  username: string
  displayName: string
  streakCurrent: number
  personalBest: number
  totalWins: number
}

function getRank(hitRate: number) {
  return FOCUS_RANKS.find(r => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Fetch all public profiles
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, username, display_name')
        .eq('is_public', true)
        .limit(100)

      if (!profiles || profiles.length === 0) {
        setLoading(false)
        return
      }

      const userIds = profiles.map(p => p.user_id as string)

      // Fetch streaks + total wins in parallel
      const [streaksRes, winsRes] = await Promise.all([
        supabase.from('streaks').select('user_id, current, personal_best').in('user_id', userIds),
        supabase.from('daily_goals').select('user_id').in('user_id', userIds).eq('completed', true),
      ])

      const streakMap = new Map<string, { current: number; personal_best: number }>()
      for (const row of streaksRes.data ?? []) {
        streakMap.set(row.user_id as string, { current: row.current as number, personal_best: row.personal_best as number })
      }

      const winsMap = new Map<string, number>()
      for (const row of winsRes.data ?? []) {
        const uid = row.user_id as string
        winsMap.set(uid, (winsMap.get(uid) ?? 0) + 1)
      }

      const board: LeaderboardEntry[] = profiles.map(p => {
        const uid = p.user_id as string
        const s = streakMap.get(uid) ?? { current: 0, personal_best: 0 }
        return {
          username: p.username as string,
          displayName: p.display_name as string,
          streakCurrent: s.current,
          personalBest: s.personal_best,
          totalWins: winsMap.get(uid) ?? 0,
        }
      })

      board.sort((a, b) => b.streakCurrent - a.streakCurrent || b.personalBest - a.personalBest)

      setEntries(board.slice(0, 50))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#0f0e0c', padding: '0 16px 64px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', maxWidth: '560px', margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'Georgia,serif', fontSize: '20px', color: '#c8922a', textDecoration: 'none' }}>
          my<span style={{ color: '#c8922a' }}>hinge</span>
        </Link>
        <Link href="/today" style={{ fontSize: '12px', color: 'rgba(245,242,234,0.4)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4px 12px' }}>
          Open app →
        </Link>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</p>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '28px', color: '#f5f2ea', fontWeight: 400, marginBottom: '6px' }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(245,242,234,0.4)' }}>
            Ranked by current streak · public profiles only
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(200,146,42,0.3)', borderTopColor: '#c8922a', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(245,242,234,0.3)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌱</p>
            <p style={{ fontSize: '15px' }}>No public profiles yet.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Be the first — set up your public streak page in Settings.</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry, i) => {
              const hitRate = entry.totalWins > 0
                ? Math.round((entry.totalWins / Math.max(entry.totalWins, entry.streakCurrent, 1)) * 100)
                : 0
              const rank = getRank(Math.min(hitRate, 100))
              const isTop3 = i < 3

              return (
                <Link
                  key={entry.username}
                  href={`/u/${entry.username}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: isTop3 ? 'rgba(200,146,42,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isTop3 ? 'rgba(200,146,42,0.18)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '14px',
                    padding: '14px 16px',
                    transition: 'border-color 0.15s',
                  }}>
                    {/* Rank number */}
                    <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                      {i < 3 ? (
                        <span style={{ fontSize: '20px' }}>{MEDALS[i]}</span>
                      ) : (
                        <span style={{ fontSize: '14px', color: 'rgba(245,242,234,0.3)', fontWeight: 600 }}>#{i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,rgba(200,146,42,0.35),rgba(42,184,126,0.25))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700, color: '#f5f2ea',
                      fontFamily: 'Georgia,serif', flexShrink: 0,
                    }}>
                      {(entry.displayName || entry.username).charAt(0).toUpperCase()}
                    </div>

                    {/* Name + rank */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: '#f5f2ea', fontWeight: 500, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.displayName || entry.username}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px' }}>{rank.icon}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.4)' }}>{rank.label}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.2)' }}>· {entry.totalWins} wins</span>
                      </div>
                    </div>

                    {/* Streak */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Georgia,serif', fontSize: '22px', color: entry.streakCurrent > 0 ? '#c8922a' : 'rgba(245,242,234,0.3)', lineHeight: 1 }}>
                        {entry.streakCurrent}
                      </p>
                      <p style={{ fontSize: '10px', color: 'rgba(245,242,234,0.3)', marginTop: '2px' }}>day streak</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: '32px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.35)', marginBottom: '14px' }}>
            Want your name on this list?
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#c8922a', color: '#0f0e0c', borderRadius: '12px', padding: '13px 28px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Join myhinge →
          </Link>
        </div>

      </div>
    </div>
  )
}
