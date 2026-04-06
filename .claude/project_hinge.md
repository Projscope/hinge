---
name: myHinge project context
description: Full product context for myHinge daily focus app — concept, tech stack, design system, v1 scope
type: project
---

App name: **myHinge** (dot intentional — "the day hinges on one thing")
Tagline: "Stop managing tasks. Start finishing goals."
Status: Next.js app scaffolded at `C:\Development\Various\Hinge\hinge-app\`

**Core rule:** One goal/day, two support tasks, hard 3-slot limit. Midnight reset, no auto-carry.

**Tech stack:**
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS v3
- Backend (v2): ASP.NET Core + PostgreSQL
- Auth: Supabase (planned)
- Payments: Stripe (web) + IAP (mobile)
- Hosting: Vercel (frontend) + Railway (API)
- Mobile (Phase 2): React Native + Expo

**App structure (`hinge-app/`):**
- `app/page.tsx` — landing page (light/cream theme)
- `app/(app)/layout.tsx` — 3-panel layout (sidebar + main + right panel, dark theme)
- `app/(app)/today/` — Screen 2: Active day
- `app/(app)/setup/` — Screen 1: Morning setup
- `app/(app)/snapshot/` — Screen 3: EOD verdict
- `app/(app)/history/` — Goal history (blurred after 7 days on free)
- `app/(app)/insights/` — Focus rank, quality score, hit rate patterns
- `app/(app)/milestones/` — Badge milestones
- `lib/store.ts` — localStorage state (useAppStore hook)
- `lib/goalQuality.ts` — Heuristic goal quality scorer (no ML)
- `lib/types.ts` — All TypeScript types

**Design tokens (Tailwind extended):**
- Dark bg: `#0e0d0b` (bg), `#161510` (bg-2), `#1e1c18` (bg-3), `#252320` (bg-4)
- Ink: `#f5f2ec`, `#c8c4b8`, `#7a7670`, `#3a3830`
- Gold accent: `#c8922a`
- Teal success: `#1a7a65` / `#22a085`
- Cream (landing): `#faf8f4`
- Fonts: DM Serif Display (headings) + DM Sans (body) + DM Mono

**V1 scope:** localStorage only (no backend), Stripe paywall stubs, all 3 screens functional.

**Why:** Solo developer. Ship v1 in 2-3 weeks. Validate D7 retention before building anything else.

**Prototypes exist at:**
- `hinge-desktop-final.html` — dark app UI prototype
- `hinge-web-lockup.html` — marketing landing page prototype
