# Hin.ge — Complete Session Notes
# Use this file to start a new Claude Code session with full context.
# Paste the contents into your CLAUDE.md or use as a session primer.

---

## PROJECT IDENTITY

**App name:** Hin.ge (the dot is intentional — "the day hinges on one thing")
**Tagline:** "Stop managing tasks. Start finishing goals."
**Type:** Daily focus app — solo developer project, web-first then mobile
**Status:** Concept finalized. Ready to build v1.

---

## CORE CONCEPT — DO NOT CHANGE

One main goal per day. Two support tasks that directly scaffold the goal.
Hard 3-slot limit — the app refuses a 4th item. This constraint IS the product.
Midnight reset — no auto-carry. Missed goals require conscious re-commitment tomorrow.

The support tasks are NOT a to-do list. They are the specific steps that make
the main goal achievable today. Everything on screen points at one outcome.

---

## THE 3-SCREEN LOOP

### Screen 1 — Morning setup (60 seconds)
- Step 1: "What's the one thing that makes today a win?"
  - Live goal quality check as user types
  - Short/vague = red warning. Specific/measurable = green confirmation
  - Scores: length + verb + object + destination heuristics (no ML in v1)
- Step 2: "What needs to happen first?" — support task 1
  - Relevance check: pushes back if unrelated to main goal
- Step 3: "What else needs to fall into place?" — support task 2
  - Ideally involves another person or dependency

### Screen 2 — Active day
- Main goal displayed with progress bar (0% / 50% / 100%)
- Two support tasks with checkboxes
- Progress bar updates live when tasks are checked
- Countdown to user's chosen end time
- Overflow log: lightweight record of interruptions
  - "Happened today — logged, not graded, won't carry over"
  - Never affects streak. Never carries over. Just records the noise.
- "End my day" button → Screen 3

### Screen 3 — End-of-day snapshot
- Binary win/miss verdict — no partial credit, no ambiguity
- Goal recap with support task completion shown
- Two streak numbers displayed separately:
  - Current streak (resets on miss)
  - Personal best (NEVER erased, permanently stored)
- Weekly hit rate % (e.g. "4 of 5 days — 80%")
- Monthly heatmap (gold = hit, red/dim = miss)
- Shareable milestone card (dark background, gold streak number)
- "Resets at midnight. Tomorrow is a blank slate."
- Midnight cron/check resets the daily state

---

## STREAK RECOVERY SYSTEM (all 3 mechanisms)

### 1. Honest reset
- Current streak → 0 on miss. Personal best → unchanged always.
- Copy: "Fresh start — today still counts" NOT "You broke your streak"
- Show weekly hit % to reframe miss as one point in a larger trend
- Heatmap shows density — one miss looks tiny after 3+ weeks

### 2. Monthly heatmap
- Calendar view, gold squares for hits
- After 3-4 weeks the density makes single misses look insignificant
- This is the long-term retention engine — they're protecting a history

### 3. Streak freeze (Pro only)
- 1 per month maximum
- NEVER two consecutive days
- ONLY offered if user did NOT open the app that day
- Implementation: local notification at 11:57 PM
  - "Your [N]-day streak ends in 3 minutes. Use your monthly freeze."
  - Fires ONLY if goal was not completed
  - CANCEL the notification when goal is marked done
  - This is a LOCAL notification, not push (works offline, more reliable)

### NEVER do this
- No grace window extending yesterday's deadline into today
- "If the deadline bends, it was never a deadline"

---

## GAMIFICATION — EARNED NOT GIMMICKY

### Milestones (streak markers only)
- 🌱 Day 1 — First win → unlocks shareable card
- 🔥 Day 7 — Week one → unlocks history + heatmap (paywall)
- ⚡ Day 14 — On a roll → unlocks insights preview
- 🎯 Day 30 — Month one → strongest share/upgrade trigger
- 💯 Day 100 — Century
- 🏔️ Day 365 — Summit
- 🔪 Sharp — 10 specific goals (quality score based)
- 🤝 Teamwork — 5 collaborative support tasks

Tapping earned badges fires confetti animation.
Locked badges visible but greyed out + desaturated.

### Focus rank (rolling 30-day hit rate — never streak length)
- 🌫️ Drifting — under 50% hit rate
- 🎯 Intentional — 50–70%
- ⚡ Focused — 70–89%
- 🔪 Sharp — 90–97%
- 🏔️ Summit — 98%+ with 30+ day streak

Rank changes happen SILENTLY — no notification, no fanfare.
NO leaderboard. Personal identity label only, never competitive.
Displayed in sidebar and insights screen.

### Goal quality score
- Rolling 30-day average goal clarity
- Correlates with hit rate: "Specific goals: 91% hit. Vague goals: 44%"
- This correlation shown to user in Pro insights
- Pro only for the analysis. Quality check at setup is FREE always.

### NEVER add
- XP / points systems
- Leaderboards of any kind
- Daily login rewards
- Achievement spam (badges for opening app, etc.)
- Level-up animations / arcade feel
Rule: gamification must make users achieve goals more consistently, not more entertained.

---

## MONETIZATION

### Free tier (forever, no card required)
- Full 3-screen daily loop — NEVER lock any part of the core ritual
- Goal quality check at setup — always free (it's the philosophy)
- Overflow log — always free
- Current streak counter — always free (it's what they protect)
- 7-day week dot view
- Win/miss verdict daily
- LOCKED: history beyond 7 days (blurred heatmap)
- LOCKED: personal best (shown as "??" — stored but hidden)
- LOCKED: streak freeze
- LOCKED: pattern insights
- LOCKED: share cards
- LOCKED: focus rank + quality score analysis
- LOCKED: home screen widget
- LOCKED: smart notifications (30min nudge + 11:57 freeze prompt)

### Pro — $4/mo ($39/yr, save 20%)
Everything in free PLUS:
- Full history + heatmap (unlimited, never deleted)
- Personal best revealed and tracked
- 1 streak freeze per month
- Pattern insights (hit rate by day, quality correlation)
- Milestone share cards (Day 7, 30, 100, personal best)
- Focus rank + goal quality score analysis
- Home screen widget (shows today's goal)
- Smart notifications

### Team — $8/seat/mo ($72/yr, min 2 seats)
Everything in Pro PLUS:
- Shared team goal (set by lead, visible to all)
- Manager read-only view of team support tasks + status
- Team hit rate dashboard
- Slack / Teams integration
- Priority support

### Paywall trigger moments (ranked by conversion power)
1. 11:57 PM — streak freeze prompt (HIGHEST — loss aversion, emotional, urgent)
2. Day 30 — share card blurred ("unlock to share your 30-day streak")
3. Day 8 — history wall (heatmap blurred past 7 days)
4. Day 14 — insights preview (data teased behind blur)
5. Any miss — personal best shown as "??" with unlock prompt

### Golden rule
NEVER show upgrade prompt on day 1, 2, or 3.
The paywall should feel like it appeared naturally at the moment the user needed it.

---

## PRICING DECISIONS — FINAL

- Free tier: full daily loop, no history, no protection
- $4/mo Pro: history + streak protection + insights
- $39/yr annual: push this at upgrade + at 3-month mark (reduces churn ~60%)
- $8/seat Team: B2B wedge, no sales team needed
- Stripe for web payments (keep 97% vs 70% with App Store IAP)
- Apple IAP for mobile (required) alongside Stripe

### REJECTED ideas (do not revisit)
- 1 goal free / 3 goals Pro → breaks product philosophy
- Separate goal pools per life area → 9 items/day destroys 60-sec ritual
- Free tier with limited daily uses → punishes early habit formation

---

## LIFE AREAS — DECIDED APPROACH

### What to build (v1.5, NOT v1)
Optional one-tap area tag on the daily goal setup.
Areas: 💼 Work, 🏠 Home, 👨‍👩‍👧 Family, 💪 Health, 🧠 Personal
One tap. Optional. Adds 2 seconds to setup. Nothing else changes.

### What it enables (v2, Pro only)
Area balance insight: "You haven't set a family goal in 14 days."
Shows which life areas user invests in vs neglects over 30 days.
This insight is more emotionally powerful than any feature.

### What NOT to build
Separate goal pools per area (1 free, 3 Pro).
Reason: destroys 60-second ritual, diffuses EOD verdict, loses product identity.

---

## CHURN REDUCTION — KEY DECISIONS

### Day 1–3 (cold start prevention)
- Pre-fill first goal field with a high-quality example goal
- Make day 1 EOD completion feel ceremonial (small animation + special copy)
- Pre-fill yesterday's goal as "starting point" from day 2 onward
- Do NOT show streak pressure before day 4 — it creates anxiety without payoff
- Day 3 re-engagement: send ONE notification "How did that goal go?" if not opened
  - Never send this message again after day 7

### Day 7 anchor
- Display streak prominently from day 4 ("Good morning — day 5 🔥")
- Day 7: explicit in-app celebration BEFORE showing the history wall paywall
- Lead with the win, then reveal the upgrade ask

### Pro retention
- Monthly insight email on the 1st: personal stats + one actionable insight
  - Subject: "Slava — your March in focus · 24 goals · 87% hit rate"
  - If tough month: "March was tough — here's what the data says"
- Pattern insights improve with more data = value compounds over time
- Personal best as sunk cost: longer they're Pro, harder to cancel
- Annual plan conversion: push at upgrade moment + 3-month mark

### Cancellation flow
- Offer 1-month PAUSE before cancel (history + streak safe during pause)
- Show what they'd lose before confirming: "You'll lose your 47-day personal best..."
- Never manipulative, just informative

### Weekly anchor (v2, Pro only — NOT v1)
- Sunday evening: optional "What's your anchor this week?" field
- Shows quietly above daily goal field as context during the week
- Sunday EOD: "Your anchor was X — did your week point at it?"
- This is the highest-leverage anti-churn feature for long-term retention
- Build after you have 500+ Pro users and real churn data

---

## NOTIFICATION STRATEGY (complete)

Rules first:
- Max 2 notifications per day
- Stop morning prompt after 3 consecutive days of no response
- NEVER send streak notification if goal already completed
- No "just checking in" messages after day 7 (condescending)

All notifications:
1. 8:00 AM daily — "🌅 Good morning. What's the one thing that makes today a win?"
   - Only if goal not set by 8:30 AM
   - Stop after 3 consecutive no-response days

2. [endTime - 30min] — "⏱ 30 minutes left today. How are you tracking?"
   - Scheduled when user sets end time
   - Skip if goal already marked done

3. 11:57 PM — "🧊 Your streak ends in 3 minutes. Use your monthly freeze."
   - LOCAL NOTIFICATION (not push — works offline)
   - Schedule when goal is set each morning
   - CANCEL immediately when goal is marked done
   - Pro upgrade trigger — highest converting moment

4. Day 3 (if not opened) — "👋 How did that goal go? No pressure — just checking in."
   - Sends once, never again

5. Day 7 streak — "🔥 7 days straight. The habit is forming."
   - Soft Pro prompt for history unlock

6. Day 30 streak — "🎯 30 days. That's rare. Your streak card is ready."
   - Strong Pro prompt — share card is blurred

7. Sunday evening (Pro) — "📈 Your week: 4 of 5 goals hit. Wednesday was your best day."
   - One sentence. No more.

---

## PLATFORM STRATEGY — FINAL

### Launch sequence
1. NOW — Web PWA (React + Vite)
   - Validate the loop. Real users. Real data.
   - Stripe for payments (keep 97% revenue)
   - Share a URL — build-in-public requires a link
   - Ship in 2–3 weeks

2. MONTH 2–3 — iOS + Android (React Native + Expo)
   - One codebase, both platforms, 85% code reuse
   - Push notifications via Expo (critical for streak freeze)
   - IAP via expo-in-app-purchases alongside Stripe

3. WHEN VALIDATED — Desktop (Electron or Tauri)
   - Wrap the web app. Low effort.

### React Native — key implementation notes
- Use expo-notifications for all push + local notifications
- Streak freeze = LOCAL notification (schedule at goal-set, cancel at completion)
- Permission ask: AFTER first goal is set, NOT on app launch (iOS one-shot ask)
- Home screen widget: needs native module — defer to v2
- Image export for share card: react-native-view-shot

### Recommended tech stack
- Frontend: React + Vite
- Backend: ASP.NET Core (your home turf)
- Database: PostgreSQL (streak = one row per user per day)
- Auth: Supabase Auth (magic link / Google SSO)
- Payments: Stripe (web) + IAP (mobile)
- Hosting: Vercel (frontend) + Railway (API)
- Mobile: React Native + Expo

---

## DATA MODEL — CORE TABLES

```
users
  id, email, created_at, plan (free|pro|team), streak_freeze_used_this_month

daily_goals
  id, user_id, date, main_goal, area_tag (nullable),
  task_1_text, task_1_done,
  task_2_text, task_2_done,
  end_time, completed (bool), created_at

overflow_items
  id, daily_goal_id, text, created_at

streaks
  user_id, current_streak, personal_best, last_active_date

notifications
  user_id, type, scheduled_for, sent_at, cancelled_at
```

Streak logic:
- On EOD snapshot completion → mark completed=true → increment current_streak
- On midnight → check if completed=true → if not, reset current_streak=0
- personal_best = MAX(personal_best, current_streak) — never decreases

---

## DESIGN LANGUAGE

### Visual identity
- Name: Hin.ge (the dot is intentional)
- Typography: DM Serif Display (headings) + DM Sans (body)
- Color palette:
  - Background: #0e0d0b (dark), #faf8f4 (light/cream)
  - Accent gold: #c8922a
  - Success teal: #1a7a65 / #22a085
  - Error red: #c0392b
- Tone: warm, intentional, calm — not gamified-arcade, not sterile-corporate

### Copy principles
- Never punish a miss: "Fresh start" not "You failed"
- Never manipulate: "4 of 5 days — 80%" not "Don't break your streak!"
- Preserve identity: "You hit 23 days. No miss erases that."
- Morning: "What needs to happen first?" not "Add a minor goal"
- Reset: "Resets at midnight. Tomorrow is a blank slate."

---

## MARKETING — KEY DECISIONS

### Primary message
"Stop managing tasks. Start finishing goals."
Broader alternative for wider audience: "One goal. Any area of your life. Every day."

### Best channels (in order)
1. Build in public on Twitter/X — developer audience, shareable story
2. Hacker News Show HN — "I built a to-do app that refuses to let you add a 4th task"
3. Streak share cards — free organic distribution at every milestone
4. Product Hunt — plan carefully, one-day spike
5. Reddit r/productivity — genuine engagement only, no selling
6. LinkedIn — for team tier B2B angle

### Build-in-public script
- Week 1: "I'm building a productivity app that refuses to let you add a 4th task."
- Week 2: The quality check mechanic as a thread
- Week 3: First user streak screenshot
- Week 6: "500 users — here's what the data says about goal quality"
- Month 3: Show HN launch

### 4DX connection (marketing angle — do not ignore)
Hinge is essentially personal 4DX — same philosophy, daily not weekly, consumer not enterprise.
100,000+ teams use 4DX. These people already believe in the philosophy.
SEO content: "4DX for personal daily execution", "How to apply 4DX to your day"
This is a pre-qualified, high-intent audience who need zero convincing.

---

## KEY METRICS TO TRACK

1. D7 retention — target: above 40% (if under 20%, core loop is broken)
2. Free → Pro conversion — target: 8% of users who reach day 8
3. Pro monthly churn — target: under 5%
4. Average streak length — proxy for product health
5. Goal quality score trend — are users writing better goals over time?

The single most important metric: D7 retention.
Everything else is secondary until this is above 40%.

---

## V1 SCOPE — SHIP THIS, NOTHING ELSE

### Include in v1
- 3-screen loop (setup, active day, snapshot)
- Goal quality check (heuristic, no ML)
- Support task relevance check (basic keyword match)
- Overflow log
- Current streak counter
- 7-day week dots
- Win/miss verdict
- Midnight reset logic
- Local storage (no backend needed for web v1)
- Basic Stripe integration for Pro paywall
- History wall blur at day 8
- Personal best (stored, shown as ??)
- Streak freeze notification (local, 11:57 PM)

### Defer to v1.5
- Area tags (one-tap, optional)
- Pattern insights (need data first)
- Monthly insight email

### Defer to v2
- Weekly anchor goal
- Area balance analysis
- Team tier
- Home screen widget (needs native module)
- Full pattern analysis (need 500+ Pro users first)
- Android (validate iOS first)
- Desktop wrapper

---

## RISKS TO KEEP IN MIND

1. HIGH — Productivity app D7 retention is brutal (80%+ churn is industry standard)
2. HIGH — "What about everything else?" objection for chaotic workdays
3. MEDIUM — Easy goals gaming to protect streaks (quality check mitigates)
4. MEDIUM — Name "Hinge" has collision with dating app — trademark check required
5. MEDIUM — iOS notification one-shot permission ask — time it after first goal is set
6. LOW — React Native home screen widget needs native module

---

## MOST IMPORTANT RULE

Ship v1 in 2-3 weeks. Get real users before building anything else.
The entire strategy depends on proving D7 retention with a real audience.
Stop designing. Start building.

---
# End of session notes
# Generated from a full product design session covering concept, UX, tech stack,
# monetization, marketing, platform strategy, and churn reduction.
