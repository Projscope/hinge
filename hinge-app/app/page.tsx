import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-cream text-[var(--lk-ink)] font-sans min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-8 bg-[rgba(250,248,244,0.92)] backdrop-blur-md border-b border-[var(--lk-border)]">
        <Link href="/" className="font-serif text-[22px] tracking-tight text-[var(--lk-ink)] no-underline">
          my<span className="text-gold">hinge</span>
        </Link>
        <ul className="flex items-center gap-4 sm:gap-8 list-none">
          <li className="hidden sm:block">
            <a href="#how-it-works" className="text-sm text-[var(--lk-muted)] hover:text-[var(--lk-ink)] transition-colors no-underline">
              How it works
            </a>
          </li>
          <li className="hidden sm:block">
            <a href="#install" className="text-sm text-[var(--lk-muted)] hover:text-[var(--lk-ink)] transition-colors no-underline">
              Install
            </a>
          </li>
          <li className="hidden sm:block">
            <a href="#pricing" className="text-sm text-[var(--lk-muted)] hover:text-[var(--lk-ink)] transition-colors no-underline">
              Pricing
            </a>
          </li>
          <li>
            <Link
              href="/today"
              className="text-[13px] font-medium bg-[var(--lk-ink)] text-cream px-[18px] py-2 rounded-[6px] no-underline hover:opacity-85 transition-opacity"
            >
              Start free →
            </Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <div className="pt-[100px] sm:pt-[140px] pb-[60px] sm:pb-[80px] px-6 sm:px-8 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left copy */}
        <div>
          <p className="text-[12px] font-medium tracking-[0.12em] uppercase text-gold mb-5">
            One question. Every morning.
          </p>
          <h1 className="font-serif text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-0.02em] text-[var(--lk-ink)] mb-6">
            What one thing, if done today, makes your <em className="italic text-gold">day?</em>
          </h1>
          <p className="text-[17px] font-light text-[var(--lk-muted)] leading-[1.65] max-w-[420px] mb-10">
            Not a to-do list. One goal that actually matters.
            Two tasks to make it happen. At the end of the day — did you nail it?
            That&apos;s the whole system.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 bg-[var(--lk-ink)] text-cream px-7 py-[14px] rounded-[8px] text-[15px] font-medium no-underline hover:opacity-85 transition-opacity"
            >
              Start for free
              <span>→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm text-[var(--lk-muted)] hover:text-[var(--lk-ink)] no-underline border-b border-[var(--lk-border)] pb-px transition-colors"
            >
              See how it works ↓
            </a>
          </div>
          <div className="mt-10 flex items-center gap-4 text-[13px] text-[var(--lk-faint)]">
            <span className="w-[6px] h-[6px] rounded-full bg-teal flex-shrink-0" />
            Free forever · No card required · 60-second setup
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center items-center relative mt-4 lg:mt-0">
          <div className="w-[280px] bg-[var(--lk-ink)] rounded-[36px] p-3 shadow-[0_40px_80px_rgba(15,14,12,0.25),0_8px_24px_rgba(15,14,12,0.12)] relative">
            <div className="w-[80px] h-[24px] bg-[var(--lk-ink)] rounded-b-[16px] mx-auto mb-2 relative z-10" />
            <div className="bg-cream rounded-[28px] overflow-hidden min-h-[520px]">
              {/* Screen header */}
              <div className="p-5 pb-4 border-b border-[var(--lk-border)]">
                <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--lk-faint)] mb-1">
                  Today · Work
                </p>
                <p className="font-serif text-[17px] text-[var(--lk-ink)] leading-tight">
                  Today&apos;s focus
                </p>
              </div>
              {/* Screen body */}
              <div className="p-5">
                <div className="bg-[var(--lk-ink)] rounded-[16px] p-4 mb-3 text-cream">
                  <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[rgba(250,248,244,0.5)] mb-1.5">
                    Main goal
                  </p>
                  <p className="font-serif text-[15px] leading-[1.35] text-cream mb-3.5">
                    Ship auth refactor to staging
                  </p>
                  <div className="h-[3px] bg-[rgba(250,248,244,0.15)] rounded-full overflow-hidden mb-1.5">
                    <div className="h-full w-1/2 bg-gold rounded-full" />
                  </div>
                  <p className="text-[10px] text-right text-[rgba(250,248,244,0.45)]">50%</p>
                </div>
                {/* Tasks */}
                <div className="divide-y divide-[var(--lk-border)]">
                  <div className="flex items-start gap-2.5 py-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-teal border-teal border flex-shrink-0 mt-0.5 flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-[13px] text-[var(--lk-faint)] line-through leading-snug">
                      Write tests for token refresh
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 py-2.5">
                    <div className="w-[18px] h-[18px] rounded-full border border-[var(--lk-border)] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[var(--lk-muted)] leading-snug">Get PR reviewed by Alex</p>
                  </div>
                </div>
              </div>
              {/* Screen footer */}
              <div className="px-5 pb-5">
                <p className="text-[11px] text-[var(--lk-faint)] flex items-center gap-1.5 mb-2.5">
                  <span className="w-[5px] h-[5px] rounded-full bg-gold inline-block" />
                  4h 22m remaining · ends 6:00 PM
                </p>
                <button className="w-full py-3 bg-[var(--gold-faint)] border border-[var(--gold-light)] rounded-[10px] text-[13px] font-medium text-[#8a5c10]">
                  End my day →
                </button>
              </div>
            </div>
          </div>

          {/* Float cards */}
          <div className="hidden sm:block absolute top-10 -right-14 bg-white rounded-[12px] px-3.5 py-2.5 shadow-[0_4px_20px_rgba(15,14,12,0.10)] border border-[var(--lk-border)]">
            <p className="font-serif text-[26px] text-[var(--lk-ink)] leading-none mb-0.5">14</p>
            <p className="text-[10px] font-medium tracking-[0.06em] uppercase text-[var(--lk-faint)]">Day streak 🔥</p>
          </div>
          <div className="hidden sm:block absolute bottom-20 -left-16 bg-white rounded-[12px] px-3.5 py-2.5 shadow-[0_4px_20px_rgba(15,14,12,0.10)] border border-[var(--lk-border)]">
            <p className="text-[10px] font-medium tracking-[0.07em] uppercase text-gold mb-1.5">Queue · Work</p>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] text-[var(--lk-muted)]">Write Q2 roadmap</p>
              <p className="text-[11px] text-[var(--lk-faint)]">Refactor billing module</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE STRIP */}
      <div className="border-y border-[var(--lk-border)] bg-white">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 text-center">
          {[
            { icon: '🎯', label: 'One goal per day' },
            { icon: '☰', label: 'Goal queue' },
            { icon: '🏷️', label: 'Life area tags' },
            { icon: '🔥', label: 'Streak tracking' },
            { icon: '📈', label: 'Pattern insights' },
            { icon: '🔔', label: 'Smart reminders' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2">
              <span className="text-[24px]">{f.icon}</span>
              <span className="text-[12px] text-[var(--lk-muted)] font-medium leading-tight">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20 px-6 sm:px-8 bg-[var(--lk-bg,#faf8f4)]">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold text-center mb-4">
            The daily ritual
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] tracking-[-0.02em] text-[var(--lk-ink)] text-center mb-4">
            Four moments. One outcome.
          </h2>
          <p className="text-[16px] font-light text-[var(--lk-muted)] text-center max-w-[540px] mx-auto mb-16 leading-[1.65]">
            Morning setup takes 60 seconds — less if you pre-loaded your queue. The rest of the day is just executing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-[var(--lk-border)] rounded-[16px] overflow-hidden">
            {[
              {
                num: '01',
                title: 'Build your queue',
                sub: 'Anytime',
                desc: 'Add goals to your queue when ideas hit — tagged by life area (work, health, family…). Morning setup pulls directly from it.',
                accent: 'text-[var(--lk-faint)]',
              },
              {
                num: '02',
                title: 'Morning setup',
                sub: '60 seconds',
                desc: 'Pick from queue or type fresh. Add two scaffolding tasks. The app scores goal quality in real time and shows which areas you\'ve been neglecting.',
                accent: 'text-gold',
              },
              {
                num: '03',
                title: 'Active day',
                sub: 'Full focus',
                desc: 'Your goal stays front and center. Check off tasks, watch the countdown. A mid-day nudge keeps you honest. Streak at risk? You\'ll know.',
                accent: 'text-teal-bright',
              },
              {
                num: '04',
                title: 'Close the day',
                sub: 'Binary verdict',
                desc: 'Hit or miss — no partial credit. Achievement overlay fires, streak updates, share card unlocks. Queue a next goal while the win is fresh.',
                accent: 'text-[var(--lk-ink)]',
              },
            ].map((step) => (
              <div key={step.num} className="bg-white p-8">
                <p className="font-mono text-[11px] text-[var(--lk-faint)] mb-5">{step.num}</p>
                <h3 className="font-serif text-[22px] text-[var(--lk-ink)] mb-1">{step.title}</h3>
                <p className={`text-[12px] font-medium uppercase tracking-wider mb-4 ${step.accent}`}>
                  {step.sub}
                </p>
                <p className="text-[14px] text-[var(--lk-muted)] leading-[1.65]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES DETAIL */}
      <section className="py-16 sm:py-20 px-6 sm:px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold text-center mb-4">
            Built to keep you coming back
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] tracking-[-0.02em] text-[var(--lk-ink)] text-center mb-16">
            Everything the habit needs.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '☰',
                title: 'Goal queue',
                desc: 'Pre-load goals any time — tagged by life area. Morning setup becomes a one-tap pick, not a blank-page moment.',
              },
              {
                icon: '🏷️',
                title: 'Area balance',
                desc: 'Work, home, family, health, personal. Each area shows when you last focused on it — so nothing important goes dark.',
              },
              {
                icon: '🔥',
                title: 'Streak + ranks',
                desc: 'Current streak, personal best, 30-day hit rate. Climb from Drifting → Intentional → Focused → Sharp → Summit.',
              },
              {
                icon: '📊',
                title: 'Contribution heatmap',
                desc: '16-week grid of hits and misses. Longest streak, best month, best area — all from real data, not demo numbers.',
              },
              {
                icon: '📈',
                title: 'Pattern insights',
                desc: 'Which day of the week is your strongest? Which area gets neglected? What goal quality score predicts a win?',
              },
              {
                icon: '🔔',
                title: 'Smart notifications',
                desc: 'Morning intention nudge, mid-day check-in with Yes / No actions, evening streak-at-risk alert. All configurable.',
              },
              {
                icon: '🏅',
                title: 'Milestones',
                desc: 'Earned badges at 3, 7, 14, 30, 50, 100-day streaks. Achievement overlay fires when a goal is completed.',
              },
              {
                icon: '🌐',
                title: 'Public streak page',
                desc: 'Share your streak and rank at myhinge.app/u/yourname. Show the world your consistency without sharing the details.',
              },
              {
                icon: '🤝',
                title: 'Accountability partner',
                desc: 'Add one person who gets notified when your streak is at risk. Social pressure, applied minimally.',
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="text-[28px] flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="font-serif text-[18px] text-[var(--lk-ink)] mb-1.5">{f.title}</h3>
                  <p className="text-[14px] text-[var(--lk-muted)] leading-[1.65]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALL AS APP */}
      <section id="install" className="py-16 sm:py-20 px-6 sm:px-8 bg-[var(--lk-bg,#faf8f4)]">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold text-center mb-4">
            No App Store needed
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] tracking-[-0.02em] text-[var(--lk-ink)] text-center mb-4">
            Install it like an app.
          </h2>
          <p className="text-[16px] font-light text-[var(--lk-muted)] text-center max-w-[500px] mx-auto mb-14 leading-[1.65]">
            myhinge is a Progressive Web App. Add it to your home screen in seconds — it looks and feels like a native app, no download required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[760px] mx-auto">
            {/* Android */}
            <div className="bg-white border border-[var(--lk-border)] rounded-[16px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[28px]">🤖</span>
                <div>
                  <p className="font-serif text-[18px] text-[var(--lk-ink)]">Android</p>
                  <p className="text-[12px] text-[var(--lk-faint)]">Chrome browser</p>
                </div>
              </div>
              <ol className="space-y-4">
                {[
                  { step: '1', text: 'Open myhinge.app in Chrome' },
                  { step: '2', text: 'Tap the ⋮ menu in the top-right corner' },
                  { step: '3', text: 'Tap "Add to Home screen"' },
                  { step: '4', text: 'Tap "Add" — done' },
                ].map((s) => (
                  <li key={s.step} className="flex items-start gap-3">
                    <span className="w-[22px] h-[22px] rounded-full bg-[var(--lk-ink)] text-cream text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <p className="text-[14px] text-[var(--lk-muted)] leading-snug">{s.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-[12px] text-[var(--lk-faint)] leading-relaxed">
                You may also see a banner at the bottom of the page saying &ldquo;Add myhinge to Home screen&rdquo; — tap that too.
              </p>
            </div>

            {/* iOS */}
            <div className="bg-white border border-[var(--lk-border)] rounded-[16px] p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[28px]">🍎</span>
                <div>
                  <p className="font-serif text-[18px] text-[var(--lk-ink)]">iPhone / iPad</p>
                  <p className="text-[12px] text-[var(--lk-faint)]">Safari browser</p>
                </div>
              </div>
              <ol className="space-y-4">
                {[
                  { step: '1', text: 'Open myhinge.app in Safari (not Chrome)' },
                  { step: '2', text: 'Tap the Share button at the bottom — the box with an arrow pointing up' },
                  { step: '3', text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: '4', text: 'Tap "Add" — done' },
                ].map((s) => (
                  <li key={s.step} className="flex items-start gap-3">
                    <span className="w-[22px] h-[22px] rounded-full bg-[var(--lk-ink)] text-cream text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <p className="text-[14px] text-[var(--lk-muted)] leading-snug">{s.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-[12px] text-[var(--lk-faint)] leading-relaxed">
                Must use Safari on iOS — Chrome on iPhone does not support Add to Home Screen for PWAs.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[var(--lk-faint)]">
            {[
              '⚡ Loads instantly — even offline',
              '🔔 Full push notifications',
              '📱 No App Store, no updates',
              '🔒 Same secure login',
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* THE CONSTRAINT */}
      <section className="py-16 sm:py-20 px-6 sm:px-8">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold mb-4">
            The philosophy
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] tracking-[-0.02em] text-[var(--lk-ink)] mb-6">
            The app refuses a 4th task.
          </h2>
          <p className="text-[17px] font-light text-[var(--lk-muted)] leading-[1.75] mb-10">
            Not because it can&apos;t — because it won&apos;t. The constraint is the product.
            Three slots forces the question you&apos;ve been avoiding: <em className="italic">what actually matters today?</em>
          </p>
          <blockquote className="border-l-4 border-gold pl-5 text-left bg-[var(--gold-faint)] rounded-r-[12px] py-4 pr-5">
            <p className="text-[14px] text-[var(--lk-muted)] leading-[1.75] italic">
              &ldquo;The support tasks are not a to-do list. They are the scaffolding
              that makes your main goal reachable today.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-20 px-6 sm:px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold text-center mb-4">
            Pricing
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] tracking-[-0.02em] text-[var(--lk-ink)] text-center mb-4">
            Free until the habit sticks.
          </h2>
          <p className="text-[16px] font-light text-[var(--lk-muted)] text-center max-w-[480px] mx-auto mb-16 leading-[1.65]">
            The core ritual is free forever. No card. No trial. No limits on daily use.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[960px] mx-auto">
            {/* Free */}
            <div className="border border-[var(--lk-border)] rounded-[16px] p-8">
              <p className="text-[11px] font-medium tracking-wider uppercase text-[var(--lk-faint)] mb-3">Free</p>
              <p className="font-serif text-[36px] text-[var(--lk-ink)] leading-none mb-1">$0</p>
              <p className="text-[13px] text-[var(--lk-faint)] mb-6">Forever. No card required.</p>
              <ul className="space-y-2.5 text-[14px] text-[var(--lk-muted)]">
                {[
                  'Full 3-screen daily loop',
                  'Goal queue + area tags',
                  'Goal quality scoring',
                  'Current streak + personal best',
                  'Weekly anchor',
                  'Win / miss verdict',
                  'Smart notifications',
                  'Public streak page + leaderboard',
                  'PWA — install on phone',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-teal mt-0.5">✓</span> {f}
                  </li>
                ))}
                {[
                  'Full history + heatmap',
                  'Pattern insights',
                  'Milestone share cards',
                  'Streak freeze',
                  'Accountability partner',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 opacity-40 line-through">
                    <span className="mt-0.5">—</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/today"
                className="mt-8 block text-center py-3 rounded-[8px] border border-[var(--lk-border)] text-[14px] font-medium text-[var(--lk-muted)] no-underline hover:border-[var(--lk-muted)] hover:text-[var(--lk-ink)] transition-colors"
              >
                Start free
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="border-2 border-[var(--lk-ink)] rounded-[16px] p-8 relative">
              <span className="absolute top-4 right-4 text-[11px] font-semibold bg-gold text-white px-2.5 py-0.5 rounded-full">
                Pro
              </span>
              <p className="text-[11px] font-medium tracking-wider uppercase text-gold mb-3">Monthly</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <p className="font-serif text-[36px] text-[var(--lk-ink)] leading-none">$4</p>
                <p className="text-[14px] text-[var(--lk-faint)]">/mo</p>
              </div>
              <p className="text-[13px] text-[var(--lk-faint)] mb-6">Billed monthly. Cancel anytime.</p>
              <ul className="space-y-2.5 text-[14px] text-[var(--lk-muted)]">
                {[
                  'Everything in Free',
                  'Full history + 16-week heatmap',
                  'Pattern insights',
                  'Focus rank + quality analytics',
                  'Milestone badges + share cards',
                  '1 streak freeze per month',
                  'Accountability partner',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/today"
                className="mt-8 block text-center py-3 rounded-[8px] bg-[var(--lk-ink)] text-cream text-[14px] font-medium no-underline hover:opacity-85 transition-opacity"
              >
                Get started →
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="border-2 border-gold rounded-[16px] p-8 relative bg-[var(--gold-faint)]">
              <span className="absolute top-4 right-4 text-[11px] font-semibold bg-gold text-white px-2.5 py-0.5 rounded-full">
                Best value
              </span>
              <p className="text-[11px] font-medium tracking-wider uppercase text-gold mb-3">Yearly</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <p className="font-serif text-[36px] text-[var(--lk-ink)] leading-none">$39</p>
                <p className="text-[14px] text-[var(--lk-faint)]">/yr</p>
              </div>
              <p className="text-[13px] text-[var(--lk-faint)] mb-6">
                <span className="text-gold font-semibold">Save 20%</span> vs monthly · $3.25/mo
              </p>
              <ul className="space-y-2.5 text-[14px] text-[var(--lk-muted)]">
                {[
                  'Everything in Pro Monthly',
                  'Two months free',
                  'Priority feature requests',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/today"
                className="mt-8 block text-center py-3 rounded-[8px] bg-gold text-black text-[14px] font-semibold no-underline hover:opacity-90 transition-opacity"
              >
                Get started →
              </Link>
            </div>
          </div>

          <p className="text-[13px] text-center text-[var(--lk-faint)] mt-8">
            Start free — upgrade anytime from Settings. Never shown a prompt in your first 3 days.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 sm:py-12 px-6 sm:px-8 border-t border-[var(--lk-border)]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0">
          <p className="font-serif text-[18px] text-[var(--lk-ink)]">
            my<span className="text-gold">hinge</span>
          </p>
          <p className="text-[13px] text-[var(--lk-faint)] text-center">
            Stop managing tasks. Start finishing goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://projscope.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 no-underline opacity-60 hover:opacity-100 transition-opacity"
              title="A projscope.com product"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://projscope.com/favicon.ico" alt="projscope" width={16} height={16} className="rounded-sm" />
              <span className="text-[12px] text-[var(--lk-muted)]">projscope.com</span>
            </a>
            <Link
              href="/today"
              className="text-[13px] font-medium text-[var(--lk-ink)] no-underline hover:text-gold transition-colors"
            >
              Open app →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
