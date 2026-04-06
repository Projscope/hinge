# myhinge

<img width="1792" height="1028" alt="image" src="https://github.com/user-attachments/assets/8172f283-857b-4aea-ae34-023dd8b89255" />
<br/>
<br/>
<img width="1796" height="1024" alt="image" src="https://github.com/user-attachments/assets/4ec66524-2f5e-43c2-9d5b-d0bbd0a1bc7b" />

> What one thing, if done today, makes your day?

Not a to-do list. One goal that actually matters. Two tasks to make it happen. At the end of the day — did you nail it? That's the whole system.

---

## What it is

myhinge is a daily focus app built around a single constraint: one main goal, two support tasks, and a hard 3-slot limit. You pre-load a goal queue tagged by life area (work, home, family, health, personal). Morning setup becomes a one-tap pick. The app tracks streaks, surfaces patterns in how you actually work, and fires an achievement overlay when you close out a win. Public profiles and a leaderboard let you share your streak with the world.

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3 with a custom dark palette
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Auth:** Magic link (email OTP) via Supabase Auth — implicit flow for cross-device support
- **Storage:** Supabase for auth/goals/queue/public profiles · localStorage for settings/anchors
- **Fonts:** DM Serif Display, DM Sans, DM Mono (Google Fonts)
- **Notifications:** Web Push API + Service Worker (`public/sw.js`)
- **PWA:** Installable on Android/iOS — manifest, offline caching, offline fallback page
- **Deploy:** Netlify with `@netlify/plugin-nextjs`

---

## Getting started

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations via the migration runner (see below) or paste all files into the **SQL Editor** in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_end_day_function.sql`
   - `supabase/migrations/003_goal_queue.sql`
   - `supabase/migrations/004_public_profiles.sql`
   - `supabase/migrations/005_onboarding_seed.sql`
   - `supabase/migrations/006_stripe.sql`
3. In **Authentication → URL Configuration**, add your production URL to the redirect allow-list:
   - `https://your-app.netlify.app/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Optionally configure a custom SMTP provider in **Authentication → SMTP Settings** to bypass Supabase's rate limits

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

# Stripe — required for Pro plan billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...     # $4/mo price ID from Stripe dashboard
STRIPE_PRICE_YEARLY=price_...      # $39/yr price ID from Stripe dashboard
```

#### Running migrations programmatically

```bash
node scripts/migrate.mjs
```

### 3. Stripe setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In the **Products** tab, create a product called "myhinge Pro" with two prices:
   - Recurring · $4.00 · Monthly → copy the `price_...` ID as `STRIPE_PRICE_MONTHLY`
   - Recurring · $39.00 · Yearly → copy the `price_...` ID as `STRIPE_PRICE_YEARLY`
3. In **Developers → Webhooks**, add an endpoint:
   - URL: `https://your-app.netlify.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret as `STRIPE_WEBHOOK_SECRET`
4. Add all four Stripe env vars to your Netlify dashboard under **Site configuration → Environment variables** and trigger a redeploy

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
    page.tsx                        # Landing page (hero, how it works, install guide, pricing)
    offline/page.tsx                # PWA offline fallback
    checkin/page.tsx                # Mid-day check-in (public — linked from notification)
    leaderboard/page.tsx            # Public streak leaderboard at /leaderboard
    u/[username]/page.tsx           # Public achievements page at /u/yourname
    (auth)/
      login/page.tsx                # Magic link sign-in form
    auth/
      callback/route.ts             # Auth callback — exchanges code for session
    (app)/
      layout.tsx                    # Server wrapper (force-dynamic)
      today/page.tsx                # Main daily view — goal + tasks + overflow log
      setup/page.tsx                # Morning setup — area picker, queue, goal + quality score
      snapshot/page.tsx             # End-of-day verdict — hit or miss
      queue/page.tsx                # Goal queue — add/remove goals by area
      history/page.tsx              # History + 16-week contribution heatmap
      insights/page.tsx             # Pattern analytics — hit rate, day breakdown, focus rank
      milestones/page.tsx           # Badge milestones tied to streak + goal quality
      settings/page.tsx             # Notifications, accountability partner, public profile, billing
    api/
      stripe/
        checkout/route.ts           # POST — create Stripe Checkout session (monthly/yearly)
        portal/route.ts             # POST — create Stripe Customer Portal session
        webhook/route.ts            # POST — handle Stripe events, update plan in DB
  components/
    layout/
      AppShell.tsx                  # Client shell — sidebar + right panel + bottom nav + onboarding seed
      Sidebar.tsx                   # Desktop left nav with logout
      RightPanel.tsx                # Desktop right stats panel (290px)
      BottomNav.tsx                 # Mobile bottom tab bar with logout
      Heatmap.tsx                   # Monthly heatmap — hover shows "April 6, 2026"
      WeekDots.tsx                  # 7-day week dots
    billing/
      BillingSection.tsx            # Plan & billing card — upgrade toggle + portal button
      UpgradeButton.tsx             # Calls /api/stripe/checkout, redirects to Stripe
    overlays/
      AchievementOverlay.tsx        # Full-screen overlay on goal completion
      ComebackBanner.tsx            # Bottom sheet after a ≥3-day gap
    snapshot/
      ShareCard.tsx                 # Streak share card
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
      PublicProfileSection.tsx      # Handle, display name, public toggle, live URL preview
    ui/
      Button.tsx                    # primary / ghost / gold variants
      Card.tsx                      # Standard card container
      Pill.tsx                      # Badge pill — gold / teal / red / neutral
      Toast.tsx                     # Auto-dismiss notification
  lib/
    store.ts                        # App state — Supabase-backed Zustand store
    types.ts                        # Shared types, FOCUS_RANKS, AREA_TAGS
    goalQuality.ts                  # Goal quality scoring (0–100)
    goalQueue.ts                    # Queue CRUD — Supabase-backed, tagged by area, onboarding seed
    weeklyAnchor.ts                 # Weekly focus phrase — resets each Monday
    notifications.ts                # Web Push prefs, scheduleNotifications, initNotifications
    accountability.ts               # Accountability partner — get/set/remove
    publicProfile.ts                # Username/displayName/isPublic — Supabase-backed, async
    publicSnapshot.ts               # Public streak snapshot — get/update (localStorage cache)
    stripe.ts                       # Lazy Stripe client — instantiated only at request time
    dateUtils.ts                    # localDateStr() — YYYY-MM-DD in device local timezone
    supabase/
      client.ts                     # Browser Supabase client (implicit flow)
      server.ts                     # Server Supabase client (cookie-based session)
  public/
    sw.js                           # Service worker — push notifications + offline caching
    manifest.json                   # PWA manifest — name, icons, start_url, shortcuts
    icon.svg                        # App icon source (SVG — regenerate PNGs from this)
    icon-192.png                    # PWA icon 192×192
    icon-512.png                    # PWA icon 512×512
    icon-maskable.png               # PWA maskable icon 512×512
    apple-touch-icon.png            # Apple home screen icon 180×180
supabase/
  migrations/
    001_initial_schema.sql          # Tables, RLS policies, auto-create profile trigger
    002_end_day_function.sql        # Atomic end_day RPC (goal verdict + streak in one tx)
    003_goal_queue.sql              # goal_queue table — Supabase-backed queue per user
    004_public_profiles.sql         # public_profiles table + public RLS on goals/streaks
    005_onboarding_seed.sql         # onboarding_seeded + is_example columns for new user setup
    006_stripe.sql                  # stripe_customer_id + plan columns on profiles
  email-templates/
    magic-link.html                 # Custom dark-themed magic link email (myhinge branded)
    reset-password.html             # Custom dark-themed password reset email
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
| Settings | `/settings` | Notifications, accountability partner, public profile, billing |
| Achievements | `/u/[username]` | Public page — stats, heatmap, milestones, goals by area |
| Leaderboard | `/leaderboard` | Top streaks across all public profiles |

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
| Public achievements page + leaderboard | ✓ | ✓ |
| PWA — installable on Android & iOS | ✓ | ✓ |
| Full history + heatmap | — | ✓ |
| Pattern insights | — | ✓ |
| Milestone share cards | — | ✓ |
| Focus rank + quality analytics | — | ✓ |
| 1 streak freeze / month | — | ✓ |
| Accountability partner | — | ✓ |

Pro: **$4/mo** (monthly) or **$39/yr** (save 20% · ~$3.25/mo). Billing is managed via Stripe Checkout + Customer Portal. Plan state is stored on the `profiles` table and updated via webhook.

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

## Stripe billing

Billing is fully integrated via three API routes:

| Route | Method | What it does |
|---|---|---|
| `/api/stripe/checkout` | POST | Creates a Checkout session for monthly or yearly Pro. Looks up or creates a Stripe Customer, stores `stripe_customer_id` on the profile. Redirects to `/settings?upgraded=1` on success. |
| `/api/stripe/portal` | POST | Creates a Customer Portal session so Pro users can cancel, change plan, or update payment details. |
| `/api/stripe/webhook` | POST | Verifies Stripe signature, handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. Updates `plan` column on `profiles` via the Supabase service-role client (bypasses RLS). |

The Stripe client (`lib/stripe.ts`) uses lazy initialization — the `Stripe` instance is created only when a route handler is actually invoked, so `STRIPE_SECRET_KEY` is never required at build time.

---

## Onboarding

New users are automatically seeded with one example goal per life area in their queue. Each item is marked with an **Example** badge and a dismissible banner explains they are placeholder templates. Seeding is guarded by `onboarding_seeded` on the `profiles` table — runs exactly once per account.

---

## PWA — installing on mobile

After deploying to production:

1. Open the site in **Chrome on Android**
2. Tap the three-dot menu → **Add to Home screen** (or accept the install banner)
3. Tap **Install**

The app opens full-screen with no browser chrome. Offline caching is handled by the service worker — static assets use cache-first, pages use network-first with an offline fallback at `/offline`.

To replace the placeholder icon: edit `public/icon.svg` and regenerate PNGs with:

```bash
cd hinge-app
node -e "
const sharp = require('sharp');
const svg = require('fs').readFileSync('./public/icon.svg');
(async () => {
  await sharp(svg).resize(192, 192).png().toFile('./public/icon-192.png');
  await sharp(svg).resize(512, 512).png().toFile('./public/icon-512.png');
  await sharp(svg).resize(512, 512).png().toFile('./public/icon-maskable.png');
  await sharp(svg).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
})();
"
```

---

## Roadmap & progress

### Done

- [x] Landing page — hero, feature strip, how it works, features grid, philosophy, pricing (3 cards: Free / Pro Monthly / Pro Yearly)
- [x] Landing page — PWA install guide section (Android + iOS step-by-step, with Install nav link)
- [x] Morning setup — area picker with neglect indicators, queue integration, goal quality scoring
- [x] Goal queue — add/remove goals tagged by life area, pulled into morning setup
- [x] Goal queue stored in Supabase — syncs across devices (migration 003)
- [x] Onboarding seed — 5 example goals (one per area) for new users, Example badge + banner
- [x] Today screen — goal display, task checkboxes, overflow log, streak at risk banner, weekly anchor
- [x] Weekly anchor — set a weekly focus phrase that persists until Monday
- [x] Mid-day check-in — `/checkin` page linked from notification action buttons
- [x] Snapshot screen — hit/miss verdict, streak update, leaderboard link
- [x] Achievement overlay — full-screen on goal completion, milestone badge, post-win queue input, share card
- [x] Comeback banner — bottom sheet after ≥3-day gap (once per session)
- [x] History screen — 16-week contribution heatmap, personal records
- [x] Insights screen — hit rate, day-of-week chart, goal quality breakdown, focus rank, pattern callouts
- [x] Milestones screen — earned/locked badges tied to streak and goal quality
- [x] Settings screen — two-column desktop layout (notifications + billing left, account + profile right)
- [x] Smart notifications — morning/midday/evening via Service Worker + Web Push API
- [x] Public achievements page — `/u/[username]` with stats, 14-day heatmap, milestones, goals by area
- [x] Leaderboard — `/leaderboard` ranked by current streak, top 50 public profiles
- [x] Public profiles in Supabase — username lookup, RLS for public reads (migration 004)
- [x] Custom Supabase email templates — magic link + password reset (dark-themed, myhinge branded)
- [x] Auth flow — implicit (not PKCE) for cross-device magic link support
- [x] Logout — confirmation dialog in sidebar (desktop) and bottom nav (mobile)
- [x] PWA — installable on Android/iOS, offline caching, offline fallback page, manifest + icons
- [x] Rebrand — myHinge → myhinge across all UI, emails, and URLs
- [x] Supabase backend — Postgres schema, RLS, magic-link auth, session middleware
- [x] `end_day` atomic RPC — streak + goal verdict in a single DB transaction
- [x] Netlify deploy — `@netlify/plugin-nextjs`, env vars via Netlify dashboard
- [x] **Stripe billing** — Checkout + Customer Portal + webhook handler; Free / Pro Monthly ($4) / Pro Yearly ($39); plan stored in `profiles` (migration 006)
- [x] **Local timezone fix** — all date lookups now use device local date via `lib/dateUtils.ts` (was UTC, broke late-evening use for western timezones)
- [x] Heatmap tooltip — hover shows full date in "Month Day, Year" format (e.g. April 6, 2026)
- [x] Personal best streak — always visible (removed Pro gate)

### Planned

- [ ] Streak freeze — consume one freeze instead of losing streak
- [ ] Share card image generation (og:image / canvas)
- [ ] Team plan — shared goals, collab task tracking
- [ ] iOS / Android native app (Capacitor)
