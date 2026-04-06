'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import GoalInput from '@/components/setup/GoalInput'
import Button from '@/components/ui/Button'
import { AREA_TAGS } from '@/lib/types'
import type { AreaTag } from '@/lib/types'
import { loadQueue, addToQueue, removeFromQueue } from '@/lib/goalQueue'
import type { QueueItem } from '@/lib/goalQueue'
import { getWeeklyAnchor, getCurrentWeekStart } from '@/lib/weeklyAnchor'
import { localDateStr } from '@/lib/dateUtils'

function todayDate(): string {
  return localDateStr()
}

const AREA_COLORS: Record<AreaTag, string> = {
  work: '#c8922a',
  home: '#3b9fd4',
  family: '#7c6df5',
  health: '#2ab87e',
  personal: '#888888',
}

const AREA_ORDER: AreaTag[] = ['work', 'home', 'family', 'health', 'personal']

function getNeglectLabel(
  area: AreaTag,
  history: { date: string; areaTag?: AreaTag; completed?: boolean }[],
  todayStr: string
): { label: string; color: string } {
  const withArea = history.filter((g) => g.areaTag === area)
  if (withArea.length === 0) {
    return { label: 'Never', color: '#c8922a' }
  }
  const latest = withArea[0].date
  if (latest === todayStr) {
    return { label: 'Active', color: '#2ab87e' }
  }
  // days since last
  const now = new Date(todayStr)
  const last = new Date(latest)
  const diff = Math.round((now.getTime() - last.getTime()) / 86_400_000)
  if (diff === 1) return { label: 'Yesterday', color: 'rgba(245,242,234,0.5)' }
  if (diff <= 5) return { label: `${diff}d ago`, color: '#c8922a' }
  return { label: `${diff}d ago`, color: '#e05a5a' }
}

export default function SetupPage() {
  const router = useRouter()
  const { setTodayGoal, today, hydrated, history } = useAppStore()
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const [mainGoal, setMainGoal] = useState('')
  const [task1, setTask1] = useState('')
  const [task2, setTask2] = useState('')
  const [endTime, setEndTime] = useState('18:00')

  // Area selection
  const [selectedArea, setSelectedArea] = useState<AreaTag | null>(null)
  const [areaExpanded, setAreaExpanded] = useState(true)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string | null>(null)

  // Queue form state for "already set" view
  const [queueFormOpen, setQueueFormOpen] = useState(false)
  const [queueText, setQueueText] = useState('')
  const [queueArea, setQueueArea] = useState<AreaTag>('work')
  const [queueSaving, setQueueSaving] = useState(false)
  const [queueAdded, setQueueAdded] = useState(false)

  // Weekly anchor
  const [weeklyAnchorText, setWeeklyAnchorText] = useState<string | null>(null)

  useEffect(() => {
    const anchor = getWeeklyAnchor()
    if (anchor && anchor.weekStart === getCurrentWeekStart()) {
      setWeeklyAnchorText(anchor.text)
    }
  }, [])

  const canProceed = mainGoal.trim().length > 5 && task1.trim().length > 2 && task2.trim().length > 2
  const goalAlreadySet = hydrated && today?.date === todayDate()
  const todayStr = todayDate()

  async function handleAreaSelect(area: AreaTag) {
    setSelectedArea(area)
    setAreaExpanded(false)
    const all = await loadQueue()
    setQueueItems(all.filter((item) => item.areaTag === area))
  }

  function handleQueueItemClick(item: QueueItem) {
    setMainGoal(item.text)
    setSelectedQueueItemId(item.id)
  }

  async function handleStart() {
    if (!canProceed) return
    // Remove the selected queue item if one was used
    if (selectedQueueItemId) {
      await removeFromQueue(selectedQueueItemId)
    }
    setTodayGoal({
      date: todayStr,
      mainGoal: mainGoal.trim(),
      areaTag: selectedArea ?? undefined,
      task1Text: task1.trim(),
      task1Done: false,
      task2Text: task2.trim(),
      task2Done: false,
      endTime,
    })
    router.push('/today')
  }

  const stepStatus = (step: 1 | 2 | 3): 'active' | 'done' | 'pending' => {
    if (step === 1) return mainGoal.trim().length > 5 ? 'done' : 'active'
    if (step === 2) return task1.trim().length > 2 ? 'done' : mainGoal.trim().length > 5 ? 'active' : 'pending'
    return task2.trim().length > 2 ? 'done' : task1.trim().length > 2 ? 'active' : 'pending'
  }

  async function handleQueueSubmit() {
    const text = queueText.trim()
    if (!text || queueSaving) return
    setQueueSaving(true)
    await addToQueue(text, queueArea)
    setQueueSaving(false)
    setQueueAdded(true)
    setQueueText('')
  }

  if (hydrated && goalAlreadySet) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <p className="text-[42px] mb-4">{today!.completed ? '🎯' : '⚡'}</p>
        <p className="font-serif text-[26px] text-ink mb-2 leading-tight">
          {today!.completed ? 'Goal achieved.' : "Today's goal is set."}
        </p>
        <p className="text-[13px] text-ink-3 max-w-[320px] leading-relaxed mb-6">
          {today!.completed
            ? "You already hit today's goal. One goal per day — come back tomorrow."
            : 'The day hinges on one thing. Go finish it.'}
        </p>

        {/* Today's goal card */}
        <div className="bg-bg-3 border border-[var(--border)] rounded-[14px] px-5 py-4 max-w-[340px] w-full text-left mb-4">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-3 font-medium mb-1.5">
            Today&apos;s goal
          </p>
          <p className="font-serif text-[16px] text-ink leading-snug">{today!.mainGoal}</p>
        </div>

        {/* Queue CTA */}
        <div className="max-w-[340px] w-full mb-6">
          {!queueFormOpen && !queueAdded && (
            <button
              onClick={() => setQueueFormOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(200,146,42,0.06)',
                border: '1px solid rgba(200,146,42,0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>☰</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#c8922a', marginBottom: '2px' }}>
                  Queue a goal for a future day
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(245,242,234,0.4)', lineHeight: 1.4 }}>
                  Pre-load goals so tomorrow&apos;s setup takes one tap.
                </span>
              </span>
            </button>
          )}

          {queueFormOpen && !queueAdded && (
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(200,146,42,0.2)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(245,242,234,0.4)', marginBottom: '10px', fontWeight: 500 }}>
                Add to queue
              </p>
              <input
                type="text"
                value={queueText}
                onChange={(e) => setQueueText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQueueSubmit()}
                placeholder="What goal do you want to tackle?"
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#f5f2ea',
                  outline: 'none',
                  marginBottom: '8px',
                  boxSizing: 'border-box',
                }}
              />
              <select
                value={queueArea}
                onChange={(e) => setQueueArea(e.target.value as AreaTag)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  color: AREA_COLORS[queueArea],
                  outline: 'none',
                  marginBottom: '10px',
                  boxSizing: 'border-box',
                }}
              >
                {AREA_ORDER.map((area) => (
                  <option key={area} value={area} style={{ color: AREA_COLORS[area], background: '#1a1814' }}>
                    {AREA_TAGS[area].icon} {AREA_TAGS[area].label}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleQueueSubmit}
                  disabled={!queueText.trim() || queueSaving}
                  style={{
                    flex: 1,
                    background: queueText.trim() && !queueSaving ? '#c8922a' : 'rgba(200,146,42,0.2)',
                    color: queueText.trim() && !queueSaving ? '#0f0e0c' : 'rgba(200,146,42,0.5)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: queueText.trim() && !queueSaving ? 'pointer' : 'not-allowed',
                  }}
                >
                  {queueSaving ? 'Adding…' : 'Add to queue'}
                </button>
                <button
                  onClick={() => setQueueFormOpen(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'rgba(245,242,234,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {queueAdded && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                padding: '10px 16px',
                background: 'rgba(26,122,101,0.12)',
                border: '1px solid rgba(26,122,101,0.25)',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#2ab87e',
                fontWeight: 500,
              }}
            >
              <span>✓</span>
              <span>Added to queue</span>
              <button
                onClick={() => { setQueueAdded(false); setQueueFormOpen(true) }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(42,184,126,0.6)', fontSize: '12px', cursor: 'pointer', marginLeft: '4px' }}
              >
                + add another
              </button>
            </div>
          )}
        </div>

        <Button onClick={() => router.push('/today')}>
          {today!.completed ? 'View today →' : 'Back to today →'}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">
            {greeting}, <em className="italic text-gold">Slava.</em>
          </h1>
          <p className="text-[12px] text-ink-3 mt-0.5">
            60 seconds. Sets the tone for everything.
          </p>
          {weeklyAnchorText && (
            <p className="text-[11px] mt-1.5" style={{ color: '#c8922a' }}>
              This week: {weeklyAnchorText}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 bg-[rgba(200,146,42,0.12)] text-gold text-[11px] font-medium px-[11px] py-1 rounded-full border border-[rgba(200,146,42,0.18)] mt-1">
          🌅 {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      <div className="px-8 pb-8 max-w-[620px]">

        {/* Area selection */}
        {!areaExpanded && selectedArea ? (
          // Collapsed area pill + queue items
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: queueItems.length > 0 ? '12px' : '0',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: `${AREA_COLORS[selectedArea]}18`,
                  border: `1px solid ${AREA_COLORS[selectedArea]}35`,
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  color: AREA_COLORS[selectedArea],
                  fontWeight: 500,
                }}
              >
                <span>{AREA_TAGS[selectedArea].icon}</span>
                <span>{AREA_TAGS[selectedArea].label}</span>
              </span>
              <button
                onClick={() => setAreaExpanded(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '11px',
                  color: 'rgba(245,242,234,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                change
              </button>
            </div>

            {/* Queue items for selected area */}
            {queueItems.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'rgba(245,242,234,0.35)',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  From your queue — tap to use
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {queueItems.map((item) => {
                    const isActive = selectedQueueItemId === item.id
                    const color = AREA_COLORS[selectedArea]
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleQueueItemClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? color + '40' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: '9px',
                          padding: '9px 13px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          width: '100%',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isActive ? color : 'rgba(245,242,234,0.2)',
                            flexShrink: 0,
                            transition: 'background 0.15s',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            color: isActive ? '#f5f2ea' : 'rgba(245,242,234,0.6)',
                          }}
                        >
                          {item.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Expanded area grid
          <div style={{ marginBottom: '20px' }}>
            <p
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(245,242,234,0.35)',
                marginBottom: '10px',
                fontWeight: 500,
              }}
            >
              Area (optional)
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: queueItems.length > 0 ? '12px' : '0',
              }}
            >
              {AREA_ORDER.map((area) => {
                const { label, icon } = AREA_TAGS[area]
                const color = AREA_COLORS[area]
                const neglect = getNeglectLabel(area, history, todayStr)
                const isSelected = selectedArea === area

                return (
                  <button
                    key={area}
                    onClick={() => handleAreaSelect(area)}
                    style={{
                      background: isSelected ? `${color}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px',
                      padding: '12px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isSelected ? color : '#f5f2ea',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: neglect.color,
                        fontWeight: 500,
                      }}
                    >
                      {neglect.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Queued goals for selected area */}
            {selectedArea && queueItems.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <p
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'rgba(245,242,234,0.35)',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  From your queue — tap to use
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {queueItems.map((item) => {
                    const isActive = selectedQueueItemId === item.id
                    const color = AREA_COLORS[selectedArea]
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleQueueItemClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? color + '40' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: '9px',
                          padding: '9px 13px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isActive ? color : 'rgba(245,242,234,0.2)',
                            flexShrink: 0,
                            transition: 'background 0.15s',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            color: isActive ? '#f5f2ea' : 'rgba(245,242,234,0.6)',
                          }}
                        >
                          {item.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-[2px] h-[2px] mb-1" />

        {/* Step 1 */}
        <StepRow
          num={1}
          status={stepStatus(1)}
          question="What's the one thing that makes today a win?"
          hint="Be specific — what exactly will be done, and where?"
        >
          <GoalInput
            value={mainGoal}
            onChange={setMainGoal}
            showQuality
            placeholder='e.g. "Ship auth refactor to staging"'
          />
        </StepRow>

        <Connector />

        {/* Step 2 */}
        <StepRow
          num={2}
          status={stepStatus(2)}
          question="What needs to happen first?"
          hint="A blocker, dependency, or first concrete action."
        >
          <GoalInput
            value={task1}
            onChange={setTask1}
            placeholder='e.g. "Write tests for token refresh logic"'
          />
          {task1.trim().length > 3 && (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(26,122,101,0.2)] text-teal-bright mt-1.5">
              ✓ Directly unblocks your goal
            </p>
          )}
        </StepRow>

        <Connector />

        {/* Step 3 */}
        <StepRow
          num={3}
          status={stepStatus(3)}
          question="What else needs to fall into place?"
          hint="A person, a decision, a dependency."
        >
          <GoalInput
            value={task2}
            onChange={setTask2}
            placeholder='e.g. "Get PR reviewed by Alex"'
          />
        </StepRow>

        {/* End time */}
        <div className="mt-5 flex items-center gap-3 text-[13px] text-ink-3">
          <span>Day ends at</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-bg-4 border border-[var(--border2)] text-ink text-[13px] rounded-[8px] px-3 py-1.5 outline-none focus:border-gold"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-6">
          <Button onClick={handleStart} disabled={!canProceed} className={!canProceed ? 'opacity-40 cursor-not-allowed' : ''}>
            Start my day →
          </Button>
          <Button variant="ghost">Save draft</Button>
        </div>

        {/* Philosophy quote */}
        <blockquote className="mt-5 border-l-[3px] border-gold pl-3.5 py-2.5 pr-3.5 bg-[var(--gold-dim)] rounded-r-[10px] text-[12px] text-[var(--gold-l)] leading-[1.7]">
          &ldquo;The support tasks are not a to-do list. They are the scaffolding that makes your main goal reachable today.&rdquo;
        </blockquote>
      </div>
    </div>
  )
}

function StepRow({
  num, status, question, hint, children,
}: {
  num: number
  status: 'active' | 'done' | 'pending'
  question: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3.5">
      <div
        className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5
          ${status === 'done' ? 'bg-teal-bright text-white' : ''}
          ${status === 'active' ? 'bg-gold text-black' : ''}
          ${status === 'pending' ? 'bg-bg-4 text-ink-3 border border-[var(--border2)]' : ''}
        `}
      >
        {status === 'done' ? '✓' : num}
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-[0.07em] text-ink-3 font-medium mb-1">
          Step {num} of 3
        </p>
        <p className="font-serif text-[18px] text-ink mb-1 leading-[1.3]">{question}</p>
        <p className="text-[12px] text-ink-3 mb-3 leading-relaxed">{hint}</p>
        {children}
      </div>
    </div>
  )
}

function Connector() {
  return <div className="w-[2px] h-[18px] bg-[var(--border2)] ml-[14px]" />
}
