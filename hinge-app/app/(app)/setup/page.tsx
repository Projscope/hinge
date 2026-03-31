'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import GoalInput from '@/components/setup/GoalInput'
import Button from '@/components/ui/Button'
import { scoreGoalQuality } from '@/lib/goalQuality'

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function SetupPage() {
  const router = useRouter()
  const { setTodayGoal, today, hydrated } = useAppStore()
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const [mainGoal, setMainGoal] = useState('')
  const [task1, setTask1] = useState('')
  const [task2, setTask2] = useState('')
  const [endTime, setEndTime] = useState('18:00')

  const quality = scoreGoalQuality(mainGoal)
  const canProceed = mainGoal.trim().length > 5 && task1.trim().length > 2 && task2.trim().length > 2
  const goalAlreadySet = hydrated && today?.date === todayDate()

  function handleStart() {
    if (!canProceed) return
    setTodayGoal({
      date: todayDate(),
      mainGoal: mainGoal.trim(),
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

  if (hydrated && goalAlreadySet) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <p className="text-[42px] mb-4">{today!.completed ? '🎯' : '⚡'}</p>
        <p className="font-serif text-[26px] text-ink mb-2 leading-tight">
          {today!.completed ? 'Goal achieved.' : "Today's goal is set."}
        </p>
        <p className="text-[13px] text-ink-3 max-w-[320px] leading-relaxed mb-6">
          {today!.completed
            ? 'You already hit today\'s goal. One goal per day — come back tomorrow.'
            : 'The day hinges on one thing. Go finish it.'}
        </p>
        <div className="bg-bg-3 border border-[var(--border)] rounded-[14px] px-5 py-4 max-w-[340px] w-full text-left mb-6">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-3 font-medium mb-1.5">
            Today&apos;s goal
          </p>
          <p className="font-serif text-[16px] text-ink leading-snug">{today!.mainGoal}</p>
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
        </div>
        <span className="inline-flex items-center gap-1.5 bg-[rgba(200,146,42,0.12)] text-gold text-[11px] font-medium px-[11px] py-1 rounded-full border border-[rgba(200,146,42,0.18)] mt-1">
          🌅 {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      <div className="px-8 pb-8 max-w-[620px]">

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
