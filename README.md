# Hin.ge

<img width="1792" height="1028" alt="image" src="https://github.com/user-attachments/assets/8172f283-857b-4aea-ae34-023dd8b89255" />
<br/>
<br/>
<img width="1796" height="1024" alt="image" src="https://github.com/user-attachments/assets/4ec66524-2f5e-43c2-9d5b-d0bbd0a1bc7b" />




> Stop managing tasks. Start finishing goals.

One goal per day. Two support tasks that scaffold it. A hard 3-slot limit the app refuses to break. The day hinges on one thing.

---

## What it is

Hin.ge is a daily focus app built around a single constraint: you get one main goal and two support tasks per day. No more. The app scores your goal quality in real time, tracks your win streak, and surfaces patterns in how you actually work.

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3 with a custom dark palette
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Auth:** Magic link (email OTP) via Supabase Auth
- **Fonts:** DM Serif Display, DM Sans, DM Mono (Google Fonts)

---

## Getting started

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the two migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_end_day_function.sql`
3. In **Authentication > URL Configuration**, add your local and production URLs to the redirect allow-list (e.g. `http://localhost:3000/**`)

### 2. Environment variables

```bash
cp hinge-app/.env.local.example hinge-app/.env.local
```

Fill in your values from the Supabase dashboard (**Settings > API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the app

```bash
cd hinge-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits to `/today`, `/setup`, etc. redirect automatically to `/login`.

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
    page.tsx                  # Landing page
    (app)/
      layout.tsx              # App shell (sidebar, right panel, bottom nav)
      today/page.tsx          # Main daily view — goal + tasks + overflow log
      setup/page.tsx          # Morning setup — goal input with quality scoring
      snapshot/page.tsx       # End-of-day verdict — hit or miss
      history/page.tsx        # 7-day / 30-day goal history
      insights/page.tsx       # Pattern analytics — hit rate, day breakdown, focus rank
      milestones/page.tsx     # Badge milestones tied to streak + goal quality
  components/
    layout/
      Sidebar.tsx             # Desktop left nav (220px)
      RightPanel.tsx          # Desktop right stats panel (290px)
      BottomNav.tsx           # Mobile bottom tab bar (6 tabs)
      Heatmap.tsx             # Monthly completion heatmap
      WeekDots.tsx            # Current week M–S dot indicators
    ui/
      Button.tsx              # primary / ghost / gold variants
      Card.tsx                # Standard card container
      Pill.tsx                # Badge pill — gold / teal / red / neutral
      Toast.tsx               # Auto-dismiss notification
      SectionTitle.tsx        # Section label component
    snapshot/
      ShareCard.tsx           # Milestone share card
  lib/
    store.ts                  # App state — localStorage persistence + actions
    types.ts                  # Shared types, FOCUS_RANKS, AREA_TAGS
```

---

## The daily loop

| Screen | Route | What happens |
|---|---|---|
| Morning setup | `/setup` | Name today's goal, add 2 tasks, get a real-time quality score |
| Active day | `/today` | Check off tasks, log overflow items, see time remaining |
| Snapshot | `/snapshot` | Hit or miss — binary verdict, streak updates, share card unlocks |

---

## Plans

| Feature | Free | Pro |
|---|---|---|
| Full 3-screen daily loop | ✓ | ✓ |
| Goal quality check | ✓ | ✓ |
| Overflow log | ✓ | ✓ |
| Current streak | ✓ | ✓ |
| 7-day week view | ✓ | ✓ |
| Win / miss verdict | ✓ | ✓ |
| Full history + heatmap | — | ✓ |
| Personal best revealed | — | ✓ |
| 1 streak freeze / month | — | ✓ |
| Pattern insights | — | ✓ |
| Milestone share cards | — | ✓ |
| Focus rank + quality score | — | ✓ |
| Smart notifications | — | ✓ |

Pro: $4/mo · $39/yr.

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

- [x] Landing page — hero, how it works, philosophy, pricing
- [x] Morning setup screen with real-time goal quality scoring
- [x] Today screen — goal display, task checkboxes, overflow log, end-of-day CTA
- [x] Snapshot screen — hit/miss verdict, streak update
- [x] History screen — past goals list with completion status
- [x] Insights screen — hit rate, day-of-week chart, goal quality breakdown, focus rank ladder
- [x] Milestones screen — earned/locked badges tied to streak and goal quality
- [x] App shell — sidebar (desktop), right stats panel (desktop), bottom tab nav (mobile)
- [x] Local state persistence via `localStorage` with midnight auto-reset
- [x] Streak tracking — current streak, personal best, missed-day reset
- [x] Free vs. Pro gating (UI-only — no payment integration yet)
- [x] Mobile-responsive layout — bottom nav, single-column pages, responsive landing
- [x] Supabase backend — Postgres schema, RLS, magic-link auth, session middleware
- [x] `end_day` atomic RPC — streak + goal verdict in a single DB transaction

### In progress

- [ ] Real goal quality scoring algorithm (currently placeholder logic)
- [ ] Actual day-of-week hit rate pulled from history (currently static demo data)

### Planned

- [ ] Payment integration (Stripe) for Pro plan
- [ ] Push / email notifications — morning reminder, end-of-day nudge
- [ ] Streak freeze — consume one freeze instead of losing streak
- [ ] Area tag filtering in history and insights
- [ ] PWA support — installable, offline-capable
- [ ] Share card image generation (og:image / canvas)
- [ ] Team plan — shared goals, collab task tracking
- [ ] iOS / Android native app
