'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AREA_TAGS, FOCUS_RANKS, type AreaTag } from '@/lib/types'
import { localDateStr } from '@/lib/dateUtils'

const AREA_ORDER: AreaTag[] = ['work', 'home', 'family', 'health', 'personal']

const AREA_COLORS: Record<AreaTag, string> = {
  work: '#c8922a',
  home: '#3b9fd4',
  family: '#7c6df5',
  health: '#2ab87e',
  personal: '#888888',
}

const MILESTONES = [
  { emoji: '🌱', label: 'First win',   threshold: 1 },
  { emoji: '🔥', label: 'Week one',    threshold: 7 },
  { emoji: '⚡', label: 'On a roll',   threshold: 14 },
  { emoji: '🎯', label: 'Month one',   threshold: 30 },
  { emoji: '💯', label: 'Century',     threshold: 100 },
  { emoji: '🏔️', label: 'Summit',     threshold: 365 },
]

interface DailyGoalRow {
  id: string
  date: string
  main_goal: string
  area_tag: string | null
  completed: boolean
}

interface StreakRow {
  current: number
  personal_best: number
}

interface ProfileData {
  displayName: string
  username: string
  streaks: StreakRow
  goals: DailyGoalRow[]
}

function relativeDate(dateStr: string): string {
  const days = Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.round(days / 7)}w ago`
  return `${Math.round(days / 30)}mo ago`
}

function DotRow({ goals }: { goals: DailyGoalRow[] }) {
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = localDateStr(d)
    const g = goals.find(g => g.date === ds)
    if (!g) return 'none'
    return g.completed ? 'hit' : 'miss'
  }) as Array<'hit' | 'miss' | 'none'>

  const colors = { hit: '#2ab87e', miss: 'rgba(192,59,43,0.7)', none: 'rgba(255,255,255,0.08)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {[last14.slice(0, 7), last14.slice(7)].map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: '6px' }}>
          {row.map((status, i) => (
            <div key={i} style={{ width: '14px', height: '14px', borderRadius: '4px', background: colors[status], flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { username: rawUsername } = await params
      const username = rawUsername.toLowerCase()

      // 1. Look up public profile
      const { data: profileRow } = await supabase
        .from('public_profiles')
        .select('user_id, display_name, username')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle()

      if (!profileRow) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const userId = profileRow.user_id as string

      // 2. Fetch streaks + goals in parallel
      const [streaksRes, goalsRes] = await Promise.all([
        supabase.from('streaks').select('current, personal_best').eq('user_id', userId).maybeSingle(),
        supabase.from('daily_goals_view').select('id, date, main_goal, area_tag, completed').eq('user_id', userId).order('date', { ascending: false }).limit(200),
      ])

      setData({
        displayName: profileRow.display_name as string,
        username: profileRow.username as string,
        streaks: {
          current: (streaksRes.data?.current as number) ?? 0,
          personal_best: (streaksRes.data?.personal_best as number) ?? 0,
        },
        goals: (goalsRes.data ?? []) as DailyGoalRow[],
      })
      setLoading(false)
    }
    load()
  }, [params])

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0f0e0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(200,146,42,0.3)', borderTopColor: '#c8922a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0f0e0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '22px', color: '#f5f2ea', marginBottom: '10px' }}>Profile not found</h1>
          <p style={{ fontSize: '14px', color: 'rgba(245,242,234,0.45)', marginBottom: '24px', lineHeight: 1.5 }}>
            This streak page doesn&apos;t exist or hasn&apos;t been made public yet.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#c8922a', color: '#0f0e0c', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Join myhinge
          </Link>
        </div>
      </div>
    )
  }

  const { displayName, username, streaks, goals } = data
  const completed = goals.filter(g => g.completed)
  const totalGoals = goals.length
  const hitRate = totalGoals > 0 ? Math.round((completed.length / totalGoals) * 100) : 0
  const rank = FOCUS_RANKS.find(r => hitRate >= r.min && hitRate <= r.max) ?? FOCUS_RANKS[0]
  const personalBest = Math.max(streaks.current, streaks.personal_best)

  // Earned milestones
  const earnedMilestones = MILESTONES.filter(m => personalBest >= m.threshold)
  // Also earn "10 wins" milestone
  const has10Wins = completed.length >= 10

  // Goals by area
  const areaStats = AREA_ORDER.map(area => {
    const areaGoals = goals.filter(g => (g.area_tag ?? 'work') === area)
    const areaCompleted = areaGoals.filter(g => g.completed)
    const rate = areaGoals.length > 0 ? Math.round((areaCompleted.length / areaGoals.length) * 100) : 0
    const recent = areaCompleted.slice(0, 5)
    return { area, total: areaGoals.length, completed: areaCompleted.length, rate, recent }
  }).filter(s => s.total > 0)

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '20px 22px',
    marginBottom: '14px',
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0f0e0c', padding: '0 16px 64px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', maxWidth: '560px', margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'Georgia,serif', fontSize: '20px', color: '#c8922a', textDecoration: 'none' }}>
          Hin<span style={{ color: '#c8922a' }}>.</span>ge
        </Link>
        <Link href="/leaderboard" style={{ fontSize: '12px', color: 'rgba(245,242,234,0.4)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4px 12px' }}>
          🏆 Leaderboard
        </Link>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Profile header */}
        <div style={{ ...card, textAlign: 'center', paddingTop: '28px', paddingBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(200,146,42,0.4),rgba(42,184,126,0.3))', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 700, color: '#f5f2ea', fontFamily: 'Georgia,serif' }}>
            {(displayName || username).charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '22px', color: '#f5f2ea', fontWeight: 400, marginBottom: '4px' }}>
            {displayName || username}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.4)', marginBottom: '14px' }}>@{username}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(42,184,126,0.08)', border: '1px solid rgba(42,184,126,0.2)', borderRadius: '999px', padding: '6px 14px' }}>
            <span style={{ fontSize: '15px' }}>{rank.icon}</span>
            <span style={{ fontSize: '13px', color: '#2ab87e', fontWeight: 500 }}>{rank.label}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Streak', value: `${streaks.current}🔥` },
            { label: 'Best', value: `${personalBest}` },
            { label: 'Hit rate', value: `${hitRate}%` },
            { label: 'Total wins', value: `${completed.length}` },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 10px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '22px', color: '#f5f2ea', marginBottom: '4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(245,242,234,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* 14-day heatmap */}
        <div style={card}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,242,234,0.35)', marginBottom: '14px' }}>
            Last 14 days
          </p>
          <DotRow goals={goals} />
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
            {([['#2ab87e', 'Hit'], ['rgba(192,59,43,0.7)', 'Missed'], ['rgba(255,255,255,0.08)', 'No data']] as const).map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.35)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        {(earnedMilestones.length > 0 || has10Wins) && (
          <div style={card}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,242,234,0.35)', marginBottom: '14px' }}>
              Milestones earned
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {earnedMilestones.map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(200,146,42,0.08)', border: '1px solid rgba(200,146,42,0.18)', borderRadius: '20px', padding: '5px 12px' }}>
                  <span style={{ fontSize: '16px' }}>{m.emoji}</span>
                  <span style={{ fontSize: '12px', color: '#c8922a', fontWeight: 500 }}>{m.label}</span>
                </div>
              ))}
              {has10Wins && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(200,146,42,0.08)', border: '1px solid rgba(200,146,42,0.18)', borderRadius: '20px', padding: '5px 12px' }}>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <span style={{ fontSize: '12px', color: '#c8922a', fontWeight: 500 }}>10 wins</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goals by area */}
        {areaStats.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,242,234,0.35)', marginBottom: '12px' }}>
              Goals by area
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {areaStats.map(({ area, total, completed: done, rate, recent }) => {
                const { icon, label } = AREA_TAGS[area]
                const color = AREA_COLORS[area]
                return (
                  <div key={area} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}25`, borderRadius: '16px', padding: '16px 20px' }}>
                    {/* Area header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'rgba(245,242,234,0.4)' }}>
                        <span><span style={{ color: '#f5f2ea', fontWeight: 600 }}>{done}</span> / {total} done</span>
                        <span style={{ color: rate >= 70 ? '#2ab87e' : rate >= 50 ? '#c8922a' : 'rgba(245,242,234,0.4)' }}>{rate}% hit</span>
                      </div>
                    </div>
                    {/* Hit rate bar */}
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${rate}%`, background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
                    </div>
                    {/* Recent completed goals */}
                    {recent.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {recent.map(g => (
                          <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#2ab87e', flexShrink: 0, marginTop: '1px' }}>✓</span>
                            <span style={{ fontSize: '13px', color: 'rgba(245,242,234,0.7)', lineHeight: 1.4, flex: 1 }}>{g.main_goal}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(245,242,234,0.25)', flexShrink: 0, marginTop: '1px' }}>{relativeDate(g.date)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: '12px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(245,242,234,0.4)', marginBottom: '14px' }}>
            Build your own streak with myhinge
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#c8922a', color: '#0f0e0c', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
            Join myhinge →
          </Link>
        </div>

      </div>
    </div>
  )
}
