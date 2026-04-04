# Hin.ge

<img width="1792" height="1028" alt="image" src="https://github.com/user-attachments/assets/8172f283-857b-4aea-ae34-023dd8b89255" />
<br/>
<br/>
<img width="1796" height="1024" alt="image" src="https://github.com/user-attachments/assets/4ec66524-2f5e-43c2-9d5b-d0bbd0a1bc7b" />

> Stop managing tasks. Start finishing goals.

One goal per day. Two support tasks that scaffold it. A goal queue so morning setup takes 10 seconds. The day hinges on one thing.

---

## What it is

Hin.ge is a daily focus app built around a single constraint: one main goal, two support tasks, and a hard 3-slot limit. You pre-load a goal queue tagged by life area (work, home, family, health, personal). Morning setup becomes a one-tap pick. The app tracks streaks, surfaces patterns in how you actually work, and fires an achievement overlay when you close out a win.

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3 with a custom dark palette
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Auth:** Magic link (email OTP) via Supabase Auth
- **Storage:** Supabase for auth/profile · localStorage for queue, streaks, settings
- **Fonts:** DM Serif Display, DM Sans, DM Mono (Google Fonts)
- **Notifications:** Web Push API + Service Worker (public/sw.js)

---

## Getting started

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations via the migration runner (see below) or paste both files into the **SQL Editor** manually:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_end_day_function.sql`
3. In **Authentication > URL Configuration**, add your production URL to the redirect allow-list (e.g. `https://your-app.netlify.app/**`) — magic links redirect there, not localhost

### 2. Environment variables

```bash
cp hinge-app/.env.local.example hinge-app/.env.local
```

Fill in your values from the Supabase dashboard (**Settings > API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Only needed to run migrations via scripts/migrate.mjs
SUPABASE_ACCESS_TOKEN=your-personal-access-token   # app.supabase.com/account/tokens
```

#### Running migrations programmatically

```bash
node scripts/migrate.mjs
```

This uses the Supabase Management API with your `SUPABASE_ACCESS_TOKEN` to execute both SQL files against the remote database.

### 3. Run the app

```bash
cd hinge-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits to `/today`, `/setup`, `/queue`, `/settings`, etc. redirect automatically to `/login`.

### Other commands

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

---

## Project structure

```
hinge-app/
  app/
    page.tsx                        # Landing page
    checkin/page.tsx                # Mid-day check-in (public — linked from notification)
    u/[username]/page.tsx           # Public streak page at /u/yourname
    (app)/
      layout.tsx                    # Server wrapper (force-dynamic)
      today/page.tsx                # Main daily view — goal + tasks + overflow log
      setup/page.tsx                # Morning setup — area picker, queue, goal + quality score
      snapshot/page.tsx             # End-of-day verdict — hit or miss
      queue/page.tsx                # Goal queue — add/remove goals by area
      history/page.tsx              # History + 16-week contribution heatmap
      insights/page.tsx             # Pattern analytics — hit rate, day breakdown, focus rank
      milestones/page.tsx           # Badge milestones tied to streak + goal quality
      settings/page.tsx             # Notifications, accountability partner, public profile
  components/
    layout/
      AppShell.tsx                  # Client shell — sidebar + right panel + bottom nav
      Sidebar.tsx                   # Desktop left nav (220px)
      RightPanel.tsx                # Desktop right stats panel (290px)
      BottomNav.tsx                 # Mobile bottom tab bar (5 tabs)
    overlays/
      AchievementOverlay.tsx        # Full-screen overlay on goal completion
      ComebackBanner.tsx            # Bottom sheet after a ≥3-day gap
    today/
      StreakAtRisk.tsx              # Amber banner when day not closed near evening
      WeeklyAnchorBanner.tsx        # Gold banner for weekly focus phrase
    history/
      ContributionHeatmap.tsx       # 16-week hit/miss grid with tooltip
      PersonalRecords.tsx           # Longest streak, best month, best area, total hits
    insights/
      PatternCallouts.tsx           # 2–4 insight cards from history patterns
    settings/
      AccountabilitySection.tsx     # Accountability partner email form
      PublicProfileSection.tsx      # Username, display name, public toggle, share URL
    ui/
      Button.tsx                    # primary / ghost / gold variants
      Card.tsx                      # Standard card container
      Pill.tsx                      # Badge pill — gold / teal / red / neutral
      Toast.tsx                     # Auto-dismiss notification
  lib/
    store.ts                        # App state — Supabase-backed Zustand store
    types.ts                        # Shared types, FOCUS_RANKS, AREA_TAGS
    goalQuality.ts                  # Goal quality scoring (0–100)
    goalQueue.ts                    # Queue CRUD — localStorage, tagged by area
    weeklyAnchor.ts                 # Weekly focus phrase — resets each Monday
    notifications.ts                # Web Push prefs, scheduleNotifications, initNotifications
    accountability.ts               # Accountability partner — get/set/remove
    publicProfile.ts                # Username/displayName/isPublic — get/set/validate
    publicSnapshot.ts               # Public streak snapshot — get/update
    supabase/
      client.ts                     # Browser Supabase client
      server.ts                     # Server Supabase client (cookie-based session)
  public/
    sw.js                           # Service worker — schedules push notifications via setTimeout
supabase/
  migrations/
    001_initial_schema.sql          # Tables, RLS policies, auto-create profile trigger
    002_end_day_function.sql        # Atomic end_day RPC (goal verdict + streak in one tx)
scripts/
  migrate.mjs                       # Migration runner (uses SUPABASE_ACCESS_TOKEN)
```

---

## The daily loop

| Screen | Route | What happens |
|---|---|---|
| Goal queue | `/queue` | Pre-load goals by area — pulled into morning setup |
| Morning setup | `/setup` | Pick from queue or type fresh, add 2 tasks, get quality score |
| Active day | `/today` | Check off tasks, see countdown, weekly anchor at top |
| Mid-day check-in | `/checkin` | Yes / No — still on track? Linked from notification |
| Snapshot | `/snapshot` | Hit or miss — streak updates, achievement overlay fires |
| History | `/history` | 16-week heatmap + personal records |
| Insights | `/insights` | Pattern callouts, day-of-week chart, focus rank |
| Settings | `/settings` | Notifications, accountability partner, public profile |

---

## Plans

| Feature | Free | Pro |
|---|---|---|
| Full 3-screen daily loop | ✓ | ✓ |
| Goal queue + area tags | ✓ | ✓ |
| Goal quality scoring | ✓ | ✓ |
| Streak + personal best | ✓ | ✓ |
| Weekly anchor | ✓ | ✓ |
| Win / miss verdict | ✓ | ✓ |
| Smart notifications | ✓ | ✓ |
| Public streak page | ✓ | ✓ |
| Full history + heatmap | — | ✓ |
| Pattern insights | — | ✓ |
| Milestone share cards | — | ✓ |
| Focus rank + quality analytics | — | ✓ |
| 1 streak freeze / month | — | ✓ |
| Accountability partner | — | ✓ |

Pro: $4/mo · $39/yr.

---

## Goal quality scoring

A goal is scored 0–100 at setup time (`lib/goalQuality.ts`):

| Signal | Points | Condition |
|---|---|---|
| Word count | +25 | Sweet spot: 5–15 words |
| Action verb | +30 | Contains: `ship`, `fix`, `deploy`, `write`, `finish`, etc. |
| Outcome word | +25 | Contains: `to`, `for`, `staging`, `client`, `deadline`, etc. |
| Specificity | +15 | Has a number or proper noun |
| Vague words | −10 each | Contains: `stuff`, `work on`, `things`, `try`, `maybe`, etc. |

- **≥ 70** → "✓ Specific"
- **35–69** → "~ Getting there"
- **< 35** → "⚠ Too vague"

---

## Focus ranks

Hit rate is calculated over your last 30 days.

| Rank | Hit rate |
|---|---|
| 🌫️ Drifting | Under 50% |
| 🎯 Intentional | 50–70% |
| ⚡ Focused | 70–89% |
| 🔪 Sharp | 90–97% |
| 🏔️ Summit | 98%+ |

---

## Roadmap & progress

### Done

- [x] Landing page — hero, feature strip, how it works, features grid, philosophy, pricing
- [x] Morning setup — area picker with neglect indicators, queue integration, goal quality scoring
- [x] Goal queue — add/remove goals tagged by life area, pulled into morning setup
- [x] Today screen — goal display, task checkboxes, overflow log, streak at risk banner, weekly anchor
- [x] Weekly anchor — set a weekly focus phrase that persists until Monday
- [x] Mid-day check-in — `/checkin` page linked from notification action buttons
- [x] Snapshot screen — hit/miss verdict, streak update
- [x] Achievement overlay — full-screen on goal completion, milestone badge, post-win queue input, share card
- [x] Comeback banner — bottom sheet after ≥3-day gap (once per session)
- [x] History screen — 16-week contribution heatmap, personal records
- [x] Insights screen — hit rate, day-of-week chart, goal quality breakdown, focus rank, pattern callouts
- [x] Milestones screen — earned/locked badges tied to streak and goal quality
- [x] Settings screen — notification prefs, accountability partner, public profile
- [x] Smart notifications — morning/midday/evening via Service Worker + Web Push API
- [x] Public streak page — `/u/[username]` with streak, rank, 14-day heatmap, join CTA
- [x] Accountability partner — email form, partner card, "Email delivery coming soon" badge
- [x] App shell — sidebar (desktop), right stats panel (desktop), bottom tab nav (mobile)
- [x] State persistence — Supabase for auth/goals, localStorage for queue/settings/streaks
- [x] Supabase backend — Postgres schema, RLS, magic-link auth, session middleware
- [x] `end_day` atomic RPC — streak + goal verdict in a single DB transaction
- [x] Netlify deploy — @netlify/plugin-nextjs, env vars via Netlify API

### Planned

- [ ] Payment integration (Stripe) for Pro plan
- [ ] Streak freeze — consume one freeze instead of losing streak
- [ ] Share card image generation (og:image / canvas)
- [ ] PWA — installable, offline-capable
- [ ] Team plan — shared goals, collab task tracking
- [ ] iOS / Android native app
