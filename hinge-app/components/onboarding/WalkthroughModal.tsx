'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    icon: '◎',
    title: 'Welcome to myhinge',
    body: 'The accountability app that keeps you honest about what actually matters today. No noise — just one goal, every day.',
    cta: null,
  },
  {
    icon: '🎯',
    title: 'One goal. Two tasks.',
    body: 'Each morning you pick the single most important thing you must finish today. Then you name two tasks that make it possible. That\'s your whole day, locked in.',
    cta: null,
  },
  {
    icon: '🔥',
    title: 'Close the day. Build your streak.',
    body: 'When your goal is done, you close the day. Complete it and your streak grows. Miss, and it resets. That tension is the accountability — it\'s supposed to sting a little.',
    cta: null,
  },
  {
    icon: '⚓',
    title: 'Set your week\'s anchor.',
    body: 'Each Monday, write one intention for the whole week. Every daily goal you set should serve that anchor. It keeps the small decisions aligned with the bigger picture.',
    cta: null,
  },
  {
    icon: '✦',
    title: 'Ready to start.',
    body: 'Let\'s set up your first day. Choose your goal, name your two tasks, and set a time to close the day. It takes less than two minutes.',
    cta: 'Start morning setup →',
  },
]

interface Props {
  onDismiss: () => void | Promise<void>
}

export default function WalkthroughModal({ onDismiss }: Props) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  async function handleNext() {
    if (isLast) {
      await onDismiss()
      router.push('/setup')
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 9, 7, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-[20px] overflow-hidden"
        style={{
          background: '#16140f',
          border: '1px solid rgba(200, 146, 42, 0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Gold top bar */}
        <div className="h-[3px] bg-gold" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.35s ease' }} />

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-ink-4 hover:text-ink-2 transition-colors text-[18px] leading-none"
          aria-label="Skip walkthrough"
        >
          ×
        </button>

        {/* Content */}
        <div className="px-8 pt-10 pb-8">
          {/* Icon */}
          <div
            className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center text-[28px] mb-6"
            style={{ background: 'rgba(200, 146, 42, 0.1)', border: '1px solid rgba(200, 146, 42, 0.2)' }}
          >
            {current.icon}
          </div>

          {/* Title */}
          <h2 className="font-serif text-[24px] text-ink leading-tight mb-3">
            {current.title}
          </h2>

          {/* Body */}
          <p className="text-[14px] text-ink-3 leading-[1.65] mb-8">
            {current.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="text-[13px] text-ink-4 hover:text-ink-2 transition-colors px-2 py-2"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 text-[13px] font-semibold py-3 rounded-[10px] transition-all"
              style={{
                background: isLast ? '#c8922a' : 'rgba(200, 146, 42, 0.15)',
                color: isLast ? '#0f0e0c' : '#c8922a',
                border: isLast ? 'none' : '1px solid rgba(200, 146, 42, 0.25)',
              }}
            >
              {isLast ? current.cta : 'Next →'}
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  background: i === step ? '#c8922a' : 'rgba(200, 146, 42, 0.25)',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
