'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import GoalInput from '@/components/setup/GoalInput'
import Button from '@/components/ui/Button'
import { AREA_TAGS, TEMPLATES, getGoalHeadline, type AreaTag, type TemplateType } from '@/lib/types'
import { loadQueue, addToQueue, removeFromQueue } from '@/lib/goalQueue'
import type { QueueItem } from '@/lib/goalQueue'
import { getWeeklyAnchor } from '@/lib/weeklyAnchor'
import { getPublicProfile } from '@/lib/publicProfile'
import { localDateStr } from '@/lib/dateUtils'
import { getNotificationPrefs } from '@/lib/notifications'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

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
  history: { date: string; areaTag?: AreaTag }[],
  todayStr: string
): { label: string; color: string } {
  const withArea = history.filter((g) => g.areaTag === area)
  if (withArea.length === 0) return { label: 'Never', color: '#c8922a' }
  const latest = withArea[0].date
  if (latest === todayStr) return { label: 'Active', color: '#2ab87e' }
  const diff = Math.round((new Date(todayStr).getTime() - new Date(latest).getTime()) / 86_400_000)
  if (diff === 1) return { label: 'Yesterday', color: 'rgba(245,242,234,0.5)' }
  if (diff <= 5) return { label: `${diff}d ago`, color: '#c8922a' }
  return { label: `${diff}d ago`, color: '#e05a5a' }
}

const DEFAULT_BLOCK_LABELS = ['Morning', 'Afternoon', 'Evening']

export default function SetupPage() {
  const router = useRouter()
  const { setTodayGoal, today, hydrated, history } = useAppStore()
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  // ── Template selection ──────────────────────────────────────────────────────
  const [template, setTemplate] = useState<TemplateType>('focus')

  // ── Shared ──────────────────────────────────────────────────────────────────
  const [dayIntention, setDayIntention] = useState('')
  const eveningReminderTime = typeof window !== 'undefined' ? getNotificationPrefs().eveningTime : '20:00'
  const [endTime, setEndTime] = useState('23:59')

  // ── Focus fields ────────────────────────────────────────────────────────────
  const [mainGoal, setMainGoal] = useState('')
  const [task1, setTask1] = useState('')
  const [task2, setTask2] = useState('')
  const [selectedArea, setSelectedArea] = useState<AreaTag | null>(null)
  const [areaExpanded, setAreaExpanded] = useState(true)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string | null>(null)

  // ── MIT fields ──────────────────────────────────────────────────────────────
  const [mitTasks, setMitTasks] = useState(['', '', ''])

  // ── Time Blocks fields ──────────────────────────────────────────────────────
  const [blockLabels, setBlockLabels] = useState(DEFAULT_BLOCK_LABELS)
  const [blockIntentions, setBlockIntentions] = useState(['', '', ''])

  // ── Life Areas fields ───────────────────────────────────────────────────────
  const [areaIntentions, setAreaIntentions] = useState<Record<AreaTag, string>>({
    work: '', home: '', family: '', health: '', personal: '',
  })

  // ── Save error ──────────────────────────────────────────────────────────────
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Queue form (goal-already-set view) ──────────────────────────────────────
  const [queueFormOpen, setQueueFormOpen] = useState(false)
  const [queueText, setQueueText] = useState('')
  const [queueArea, setQueueArea] = useState<AreaTag>('work')
  const [queueSaving, setQueueSaving] = useState(false)
  const [queueAdded, setQueueAdded] = useState(false)

  // ── Meta ────────────────────────────────────────────────────────────────────
  const [weeklyAnchorText, setWeeklyAnchorText] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    getWeeklyAnchor().then((anchor) => { if (anchor) setWeeklyAnchorText(anchor.text) })
    getPublicProfile().then((p) => { if (p?.displayName) setDisplayName(p.displayName) })
  }, [])

  const goalAlreadySet = hydrated && today?.date === todayDate()
  const todayStr = todayDate()

  // ── Validation ──────────────────────────────────────────────────────────────
  const canProceed = (() => {
    if (template === 'focus') return mainGoal.trim().length > 5 && task1.trim().length > 2 && task2.trim().length > 2
    if (template === 'mit') return dayIntention.trim().length > 2 && mitTasks.filter((t) => t.trim().length > 2).length >= 1
    if (template === 'timeblocks') return dayIntention.trim().length > 2 && blockIntentions.filter((b) => b.trim().length > 2).length >= 1
    if (template === 'lifeareas') return dayIntention.trim().length > 2 && Object.values(areaIntentions).filter((v) => v.trim().length > 2).length >= 1
    return false
  })()

  // ── Handlers ─────────────────────────────────────────────────────────────────

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
    setSaveError(null)

    let ok = false

    if (template === 'focus') {
      if (selectedQueueItemId) await removeFromQueue(selectedQueueItemId)
      ok = await setTodayGoal({
        date: todayStr,
        templateType: 'focus',
        dayIntention: dayIntention.trim() || undefined,
        areaTag: selectedArea ?? undefined,
        mainGoal: mainGoal.trim(),
        task1Text: task1.trim(),
        task1Done: false,
        task2Text: task2.trim(),
        task2Done: false,
        endTime,
      })
    } else if (template === 'mit') {
      ok = await setTodayGoal({
        date: todayStr,
        templateType: 'mit',
        dayIntention: dayIntention.trim() || undefined,
        task1Text: mitTasks[0].trim(),
        task1Done: false,
        task2Text: mitTasks[1].trim(),
        task2Done: false,
        task3Text: mitTasks[2].trim(),
        task3Done: false,
        endTime,
      })
    } else if (template === 'timeblocks') {
      ok = await setTodayGoal({
        date: todayStr,
        templateType: 'timeblocks',
        dayIntention: dayIntention.trim() || undefined,
        block1Label: blockLabels[0],
        block1Intention: blockIntentions[0].trim(),
        block1Done: false,
        block2Label: blockLabels[1],
        block2Intention: blockIntentions[1].trim(),
        block2Done: false,
        block3Label: blockLabels[2],
        block3Intention: blockIntentions[2].trim(),
        block3Done: false,
        endTime,
      })
    } else if (template === 'lifeareas') {
      ok = await setTodayGoal({
        date: todayStr,
        templateType: 'lifeareas',
        dayIntention: dayIntention.trim() || undefined,
        workIntention: areaIntentions.work.trim(),
        workDone: false,
        homeIntention: areaIntentions.home.trim(),
        homeDone: false,
        familyIntention: areaIntentions.family.trim(),
        familyDone: false,
        healthIntention: areaIntentions.health.trim(),
        healthDone: false,
        personalIntention: areaIntentions.personal.trim(),
        personalDone: false,
        endTime,
      })
    }

    if (!ok) {
      setSaveError('Could not save your goal — please try again.')
      return
    }

    router.push('/today')
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

  // ── Goal already set view ────────────────────────────────────────────────────
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

        <div className="bg-bg-3 border border-[var(--border)] rounded-[14px] px-5 py-4 max-w-[340px] w-full text-left mb-4">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-3 font-medium mb-1">
            {TEMPLATES.find((t) => t.type === today!.templateType)?.label ?? 'Today'}
          </p>
          <p className="font-serif text-[16px] text-ink leading-snug">
            {getGoalHeadline(today!) || '—'}
          </p>
        </div>

        <div className="max-w-[340px] w-full mb-6">
          {!queueFormOpen && !queueAdded && (
            <button
              onClick={() => setQueueFormOpen(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>☰</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#c8922a', marginBottom: '2px' }}>Queue a goal for a future day</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(245,242,234,0.4)', lineHeight: 1.4 }}>Pre-load goals so tomorrow&apos;s setup takes one tap.</span>
              </span>
            </button>
          )}
          {queueFormOpen && !queueAdded && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,146,42,0.2)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(245,242,234,0.4)', marginBottom: '10px', fontWeight: 500 }}>Add to queue</p>
              <input type="text" value={queueText} onChange={(e) => setQueueText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQueueSubmit()} placeholder="What goal do you want to tackle?" autoFocus style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#f5f2ea', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' }} />
              <select value={queueArea} onChange={(e) => setQueueArea(e.target.value as AreaTag)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', color: AREA_COLORS[queueArea], outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}>
                {AREA_ORDER.map((area) => (
                  <option key={area} value={area} style={{ color: AREA_COLORS[area], background: '#1a1814' }}>{AREA_TAGS[area].icon} {AREA_TAGS[area].label}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleQueueSubmit} disabled={!queueText.trim() || queueSaving} style={{ flex: 1, background: queueText.trim() && !queueSaving ? '#c8922a' : 'rgba(200,146,42,0.2)', color: queueText.trim() && !queueSaving ? '#0f0e0c' : 'rgba(200,146,42,0.5)', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '13px', fontWeight: 600, cursor: queueText.trim() && !queueSaving ? 'pointer' : 'not-allowed' }}>
                  {queueSaving ? 'Adding…' : 'Add to queue'}
                </button>
                <button onClick={() => setQueueFormOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: 'rgba(245,242,234,0.4)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          {queueAdded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '10px 16px', background: 'rgba(26,122,101,0.12)', border: '1px solid rgba(26,122,101,0.25)', borderRadius: '10px', fontSize: '13px', color: '#2ab87e', fontWeight: 500 }}>
              <span>✓</span><span>Added to queue</span>
              <button onClick={() => { setQueueAdded(false); setQueueFormOpen(true) }} style={{ background: 'transparent', border: 'none', color: 'rgba(42,184,126,0.6)', fontSize: '12px', cursor: 'pointer', marginLeft: '4px' }}>+ add another</button>
            </div>
          )}
        </div>

        <Button onClick={() => router.push('/today')}>
          {today!.completed ? 'View today →' : 'Back to today →'}
        </Button>
      </div>
    )
  }

  // ── Setup form ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="px-8 pt-7 mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight">
            {displayName ? <>{greeting}, <em className="italic text-gold">{displayName}.</em></> : <>{greeting}.</>}
          </h1>
          <p className="text-[12px] text-ink-3 mt-0.5">60 seconds. Sets the tone for everything.</p>
          {weeklyAnchorText && (
            <p className="text-[11px] mt-1.5 text-gold">This week: {weeklyAnchorText}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 bg-[rgba(200,146,42,0.12)] text-gold text-[11px] font-medium px-[11px] py-1 rounded-full border border-[rgba(200,146,42,0.18)] mt-1">
          🌅 {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      <div className="px-8 pb-8 max-w-[620px]">

        {/* ── Step 0: Template picker ─────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-3">
            Today&apos;s structure
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => {
              const active = template === t.type
              return (
                <button
                  key={t.type}
                  onClick={() => setTemplate(t.type)}
                  className={`text-left rounded-[12px] px-3.5 py-3 border transition-all ${
                    active
                      ? 'bg-[rgba(200,146,42,0.1)] border-[rgba(200,146,42,0.4)]'
                      : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  <p className={`text-[12px] font-semibold mb-0.5 ${active ? 'text-gold' : 'text-ink'}`}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-ink-4 leading-snug">{t.slots}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-px h-px mb-1" />

        {/* ── Optional day intention (all templates) ──────────────────────── */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-2">
            Day theme{' '}
            {template === 'mit' || template === 'lifeareas' || template === 'timeblocks'
              ? <span className="normal-case tracking-normal text-gold opacity-90">required</span>
              : <span className="normal-case tracking-normal text-ink-4 opacity-60">(optional)</span>}
          </p>
          <input
            type="text"
            value={dayIntention}
            onChange={(e) => setDayIntention(e.target.value)}
            placeholder={template === 'focus' ? 'e.g. "Ship the auth refactor"' : 'e.g. "Recovery day" or "Deep work sprint"'}
            className="w-full bg-bg-4 border border-[var(--border2)] text-ink text-[13px] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-gold placeholder:text-ink-4"
          />
        </div>

        <Divider />

        {/* ── Focus form ───────────────────────────────────────────────────── */}
        {template === 'focus' && (
          <>
            {/* Area selection */}
            {!areaExpanded && selectedArea ? (
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${AREA_COLORS[selectedArea]}18`, border: `1px solid ${AREA_COLORS[selectedArea]}35`, borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: AREA_COLORS[selectedArea], fontWeight: 500 }}>
                    {AREA_TAGS[selectedArea].icon} {AREA_TAGS[selectedArea].label}
                  </span>
                  <button onClick={() => setAreaExpanded(true)} className="text-[11px] text-ink-4 hover:text-ink-3 transition-colors">change</button>
                </div>
                {queueItems.length > 0 && <QueueList items={queueItems} selectedId={selectedQueueItemId} color={AREA_COLORS[selectedArea]} onSelect={handleQueueItemClick} />}
              </div>
            ) : (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-2">Area (optional)</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {AREA_ORDER.map((area) => {
                    const { label, icon } = AREA_TAGS[area]
                    const color = AREA_COLORS[area]
                    const neglect = getNeglectLabel(area, history, todayStr)
                    const isSelected = selectedArea === area
                    return (
                      <button key={area} onClick={() => handleAreaSelect(area)} style={{ background: isSelected ? `${color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${isSelected ? color + '50' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: '18px' }}>{icon}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? color : '#f5f2ea' }}>{label}</span>
                        <span style={{ fontSize: '9px', color: neglect.color, fontWeight: 500 }}>{neglect.label}</span>
                      </button>
                    )
                  })}
                </div>
                {selectedArea && queueItems.length > 0 && <QueueList items={queueItems} selectedId={selectedQueueItemId} color={AREA_COLORS[selectedArea]} onSelect={handleQueueItemClick} />}
              </div>
            )}

            <StepRow num={1} status={focusStep(1, mainGoal, task1, task2)} question="What's the one thing that makes today a win?" hint="Be specific — what exactly will be done, and where?">
              <GoalInput value={mainGoal} onChange={setMainGoal} showQuality placeholder='e.g. "Ship auth refactor to staging"' />
            </StepRow>
            <Connector />
            <StepRow num={2} status={focusStep(2, mainGoal, task1, task2)} question="What needs to happen first?" hint="A blocker, dependency, or first concrete action.">
              <GoalInput value={task1} onChange={setTask1} placeholder='e.g. "Write tests for token refresh logic"' />
              {task1.trim().length > 3 && (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(26,122,101,0.2)] text-teal-bright mt-1.5">✓ Directly unblocks your goal</p>
              )}
            </StepRow>
            <Connector />
            <StepRow num={3} status={focusStep(3, mainGoal, task1, task2)} question="What else needs to fall into place?" hint="A person, a decision, a dependency.">
              <GoalInput value={task2} onChange={setTask2} placeholder='e.g. "Get PR reviewed by Alex"' />
            </StepRow>

            <blockquote className="mt-5 border-l-[3px] border-gold pl-3.5 py-2.5 pr-3.5 bg-[var(--gold-dim)] rounded-r-[10px] text-[12px] text-[var(--gold-l)] leading-[1.7]">
              &ldquo;The support tasks are not a to-do list. They are the scaffolding that makes your main goal reachable today.&rdquo;
            </blockquote>
          </>
        )}

        {/* ── MIT form ─────────────────────────────────────────────────────── */}
        {template === 'mit' && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-1">Most important tasks</p>
            <p className="text-[11px] text-ink-4 mb-3">Fill in the tasks you want to tackle today — at least one. Others are optional.</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-bg-4 border border-[var(--border2)] text-[11px] font-semibold text-ink-3 flex items-center justify-center flex-shrink-0">
                    {mitTasks[i].trim().length > 2 ? '✓' : i + 1}
                  </span>
                  <p className="text-[13px] font-medium text-ink">Task {i + 1}</p>
                </div>
                <GoalInput
                  value={mitTasks[i]}
                  onChange={(val) => setMitTasks((prev) => prev.map((t, idx) => idx === i ? val : t))}
                  placeholder={['e.g. "Finish the migration script"', 'e.g. "Review team PRs"', 'e.g. "Write the project brief"'][i]}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Time Blocks form ──────────────────────────────────────────────── */}
        {template === 'timeblocks' && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-1">One intention per block</p>
            <p className="text-[11px] text-ink-4 mb-3">Fill in the blocks relevant to today — at least one. Others are optional.</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={blockLabels[i]}
                    onChange={(e) => setBlockLabels((prev) => prev.map((l, idx) => idx === i ? e.target.value : l))}
                    className="bg-bg-4 border border-[var(--border2)] text-gold text-[11px] font-semibold rounded-[6px] px-2.5 py-1 outline-none focus:border-gold w-[120px]"
                  />
                  <span className="text-[10px] text-ink-4">label (editable)</span>
                </div>
                <GoalInput
                  value={blockIntentions[i]}
                  onChange={(val) => setBlockIntentions((prev) => prev.map((b, idx) => idx === i ? val : b))}
                  placeholder={['e.g. "Deep work — finish the migration"', 'e.g. "Meetings and reviews"', 'e.g. "Wind down, plan tomorrow"'][i]}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Life Areas form ───────────────────────────────────────────────── */}
        {template === 'lifeareas' && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-medium mb-1">One intention per area</p>
            <p className="text-[11px] text-ink-4 mb-4">Fill in the areas relevant to today — at least one. Day is complete when 3 or more are done.</p>
            {AREA_ORDER.map((area) => {
              const { label, icon } = AREA_TAGS[area]
              const color = AREA_COLORS[area]
              const filled = areaIntentions[area].trim().length > 2
              return (
                <div key={area} className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: filled ? color : '#f5f2ea' }}>{label}</span>
                    {filled && <span className="text-[10px] text-teal-bright">✓</span>}
                  </div>
                  <GoalInput
                    value={areaIntentions[area]}
                    onChange={(val) => setAreaIntentions((prev) => ({ ...prev, [area]: val }))}
                    placeholder={`What's your ${label.toLowerCase()} intention today?`}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* ── End time ─────────────────────────────────────────────────────── */}
        <div className="mt-5">
          <div className="flex items-center gap-3 text-[13px] text-ink-3">
            <span>Day ends at</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-bg-4 border border-[var(--border2)] text-ink text-[13px] rounded-[8px] px-3 py-1.5 outline-none focus:border-gold"
            />
          </div>
          {toMinutes(endTime) < toMinutes(eveningReminderTime) && (
            <p className="mt-2 text-[11px] text-gold leading-relaxed">
              ⚠ Your day closes ({endTime}) before the evening reminder ({eveningReminderTime}). Adjust either time in Settings.
            </p>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        {saveError && (
          <p className="mt-5 text-[12px] text-[rgba(192,57,43,0.9)] bg-[var(--danger-dim)] border border-[rgba(192,57,43,0.2)] rounded-[10px] px-4 py-2.5 leading-relaxed">
            {saveError}
          </p>
        )}
        <div className="flex gap-2.5 mt-4">
          <Button onClick={handleStart} disabled={!canProceed} className={!canProceed ? 'opacity-40 cursor-not-allowed' : ''}>
            Start my day →
          </Button>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function focusStep(step: 1 | 2 | 3, mainGoal: string, task1: string, task2: string): 'active' | 'done' | 'pending' {
  if (step === 1) return mainGoal.trim().length > 5 ? 'done' : 'active'
  if (step === 2) return task1.trim().length > 2 ? 'done' : mainGoal.trim().length > 5 ? 'active' : 'pending'
  return task2.trim().length > 2 ? 'done' : task1.trim().length > 2 ? 'active' : 'pending'
}

function StepRow({ num, status, question, hint, children }: {
  num: number
  status: 'active' | 'done' | 'pending'
  question: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3.5">
      <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5 ${status === 'done' ? 'bg-teal-bright text-white' : status === 'active' ? 'bg-gold text-black' : 'bg-bg-4 text-ink-3 border border-[var(--border2)]'}`}>
        {status === 'done' ? '✓' : num}
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-[0.07em] text-ink-3 font-medium mb-1">Step {num} of 3</p>
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

function Divider() {
  return <div className="h-px bg-[var(--border)] my-5" />
}

function QueueList({ items, selectedId, color, onSelect }: {
  items: QueueItem[]
  selectedId: string | null
  color: string
  onSelect: (item: QueueItem) => void
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.07em] text-ink-4 font-medium mb-2">From your queue — tap to use</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const isActive = selectedId === item.id
          return (
            <button key={item.id} onClick={() => onSelect(item)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? color + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: '9px', padding: '9px 13px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', width: '100%' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? color : 'rgba(245,242,234,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: isActive ? '#f5f2ea' : 'rgba(245,242,234,0.6)' }}>{item.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
