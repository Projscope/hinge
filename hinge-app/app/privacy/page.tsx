import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — myhinge',
  description: 'How myhinge collects, stores, and uses your data.',
}

const LAST_UPDATED = 'April 6, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-[22px] text-[var(--lk-ink)] mb-4 tracking-[-0.01em]">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] text-[var(--lk-muted)] leading-[1.75]">
        {children}
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-3 border-b border-[var(--lk-border)] text-[14px]">
      <span className="text-[var(--lk-muted)] font-medium">{label}</span>
      <span className="text-[var(--lk-muted)]">{value}</span>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-cream text-[var(--lk-ink)] font-sans min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-8 bg-[rgba(250,248,244,0.92)] backdrop-blur-md border-b border-[var(--lk-border)]">
        <Link href="/" className="font-serif text-[22px] tracking-tight text-[var(--lk-ink)] no-underline">
          my<span className="text-gold">hinge</span>
        </Link>
        <Link
          href="/today"
          className="text-[13px] font-medium bg-[var(--lk-ink)] text-cream px-[18px] py-2 rounded-[6px] no-underline hover:opacity-85 transition-opacity"
        >
          Open app →
        </Link>
      </nav>

      {/* CONTENT */}
      <div className="pt-[100px] pb-[80px] px-6 sm:px-8 max-w-[720px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-gold mb-4">
            Legal
          </p>
          <h1 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-0.02em] text-[var(--lk-ink)] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-[var(--lk-faint)]">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 text-[15px] text-[var(--lk-muted)] leading-[1.75]">
            myhinge is a daily focus app built by{' '}
            <a href="https://projscope.com" target="_blank" rel="noopener noreferrer" className="text-[var(--lk-ink)] underline underline-offset-2">
              projscope.com
            </a>
            . This policy explains what data we collect, how we use it, and what choices you have.
            We keep this plain and specific — no boilerplate.
          </p>
        </div>

        <hr className="border-[var(--lk-border)] mb-12" />

        <Section title="1. What we collect">
          <p>We collect only what is necessary to run the app.</p>

          <p className="font-medium text-[var(--lk-ink)] mt-2">Account data</p>
          <p>
            When you sign in, we store your <strong>email address</strong> in Supabase Auth.
            We use magic links (one-time email codes) — there is no password.
          </p>

          <p className="font-medium text-[var(--lk-ink)] mt-2">Your goals and tasks</p>
          <p>
            Everything you enter in the app — daily goals, support tasks, overflow notes, and
            your goal queue — is stored in our database under your account and is{' '}
            <strong>private by default</strong>. You can optionally make your profile public
            (see section 4).
          </p>

          <p className="font-medium text-[var(--lk-ink)] mt-2">Streak and activity data</p>
          <p>
            We store your current streak, personal best streak, hit/miss history, and the date
            you last completed a goal. This is used to power streaks, rank, heatmaps, and insights.
          </p>

          <p className="font-medium text-[var(--lk-ink)] mt-2">Payment data</p>
          <p>
            If you upgrade to Pro, your payment is processed by{' '}
            <strong>Stripe</strong>. We store your Stripe customer ID and subscription status.
            We never see or store your card number — Stripe handles all payment details directly.
          </p>

          <p className="font-medium text-[var(--lk-ink)] mt-2">Device-local data</p>
          <p>
            Some preferences are stored only in your browser&apos;s <code className="text-[13px] bg-[var(--lk-border)] px-1.5 py-0.5 rounded">localStorage</code> and
            never leave your device:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Notification times (morning, mid-day, evening)</li>
            <li>Weekly focus phrase</li>
            <li>Dismissed banner state</li>
            <li>Cached public streak snapshot (for the share card)</li>
          </ul>
        </Section>

        <Section title="2. How we use your data">
          <div className="rounded-[12px] border border-[var(--lk-border)] overflow-hidden">
            <div className="grid grid-cols-[180px_1fr] gap-4 px-4 py-3 bg-[var(--lk-border)] text-[12px] font-semibold uppercase tracking-wider text-[var(--lk-faint)]">
              <span>Data</span>
              <span>Why we use it</span>
            </div>
            <div className="px-4">
              <Row label="Email address" value="Send the magic-link sign-in email. Stripe uses it to create a billing customer." />
              <Row label="Goals & tasks" value="Display your daily focus view, populate history, power insights and heatmap." />
              <Row label="Streak data" value="Track streaks, calculate your focus rank, populate the leaderboard (if public)." />
              <Row label="Stripe customer ID" value="Link your account to your subscription so we can unlock Pro features." />
              <Row label="Notification prefs" value="Schedule browser notifications at your chosen times (processed locally on-device)." />
            </div>
          </div>
          <p className="mt-4">
            We do not sell your data, show you ads, or use your goals for any purpose other than
            running the app for you.
          </p>
        </Section>

        <Section title="3. Cookies and sessions">
          <p>
            We use a single session cookie managed by{' '}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--lk-ink)] underline underline-offset-2">Supabase</a>{' '}
            to keep you signed in. It is HTTP-only and scoped to this domain. We do not use
            advertising cookies, tracking pixels, or analytics cookies.
          </p>
          <p>
            Notification preferences and other settings live in your browser&apos;s{' '}
            <code className="text-[13px] bg-[var(--lk-border)] px-1.5 py-0.5 rounded">localStorage</code> — not cookies —
            and are never transmitted to our servers.
          </p>
        </Section>

        <Section title="4. Public profiles and the leaderboard">
          <p>
            By default your account is entirely private. You can optionally enable a public
            profile in <strong>Settings → Public profile</strong>. When enabled:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your chosen display name and username become publicly accessible at <code className="text-[13px] bg-[var(--lk-border)] px-1.5 py-0.5 rounded">myhinge.app/u/yourname</code></li>
            <li>Your current streak, personal best, hit rate, and earned milestones are visible to anyone with the link</li>
            <li>Your completed goal texts and life-area breakdown are visible on your public page</li>
            <li>You appear on the leaderboard at <code className="text-[13px] bg-[var(--lk-border)] px-1.5 py-0.5 rounded">myhinge.app/leaderboard</code></li>
          </ul>
          <p>
            You can turn this off at any time in Settings. Your profile will stop appearing publicly
            immediately.
          </p>
          <p>
            <strong>Important:</strong> if your profile is public, the text of your daily goals is
            visible to anyone — including search engines. Do not include sensitive personal
            information in your goals if your profile is public.
          </p>
        </Section>

        <Section title="5. Third-party services">
          <p>The following third-party services process your data as part of running myhinge:</p>

          <div className="rounded-[12px] border border-[var(--lk-border)] overflow-hidden mt-2">
            <div className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 bg-[var(--lk-border)] text-[12px] font-semibold uppercase tracking-wider text-[var(--lk-faint)]">
              <span>Service</span>
              <span>Purpose &amp; data involved</span>
            </div>
            <div className="px-4">
              <Row label="Supabase" value="Database and authentication. Stores your goals, streaks, profile, and session. Hosted in the EU or US depending on project region. supabase.com/privacy" />
              <Row label="Stripe" value="Payment processing for Pro plan. Receives your email and manages subscription billing. stripe.com/privacy" />
              <Row label="Netlify" value="Hosting. Serves the app and API routes. May log IP addresses in access logs. netlify.com/privacy" />
            </div>
          </div>
          <p className="mt-4">
            We do not use Google Analytics, Facebook Pixel, Mixpanel, or any other analytics or
            advertising SDK.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            Your data is kept for as long as your account is active. If you delete your account,
            all personal data — goals, streaks, public profile, and queue — is permanently
            deleted from our database.
          </p>
          <p>
            Stripe may retain billing records for legal and financial compliance purposes in
            accordance with their own retention policy.
          </p>
          <p>
            Data stored in your browser&apos;s localStorage is under your control and can be
            cleared at any time through your browser settings.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>You can at any time:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Access</strong> your data — all your goals, history, and settings are visible within the app</li>
            <li><strong>Make your profile private</strong> — turn off public profile in Settings instantly</li>
            <li><strong>Cancel your subscription</strong> — via Settings → Plan &amp; billing → Manage subscription</li>
            <li><strong>Delete your account</strong> — email us at <a href="mailto:support@projscope.com" className="text-[var(--lk-ink)] underline underline-offset-2">support@projscope.com</a> and we will permanently delete all your data within 30 days</li>
          </ul>
          <p>
            If you are in the EU/EEA, you also have rights under GDPR including the right to
            data portability and the right to lodge a complaint with your local supervisory authority.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            All data is transmitted over HTTPS. Database access is protected by Row Level Security
            (RLS) — each user can only access their own rows. Session tokens are stored in
            HTTP-only cookies to prevent client-side script access.
          </p>
          <p>
            We do not store passwords. Authentication is entirely via one-time email links issued
            by Supabase.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            myhinge is not directed at children under 13. We do not knowingly collect data from
            children under 13. If you believe a child under 13 has created an account, please
            contact us at{' '}
            <a href="mailto:support@projscope.com" className="text-[var(--lk-ink)] underline underline-offset-2">support@projscope.com</a>{' '}
            and we will delete the account.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            If we make material changes to this policy, we will update the date at the top of
            this page. Continued use of the app after changes constitutes acceptance of the
            revised policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or requests? Email us at{' '}
            <a href="mailto:support@projscope.com" className="text-[var(--lk-ink)] underline underline-offset-2">
              support@projscope.com
            </a>
            {' '}or visit{' '}
            <a href="https://projscope.com" target="_blank" rel="noopener noreferrer" className="text-[var(--lk-ink)] underline underline-offset-2">
              projscope.com
            </a>.
          </p>
        </Section>
      </div>

      {/* FOOTER */}
      <footer className="py-10 px-6 sm:px-8 border-t border-[var(--lk-border)]">
        <div className="max-w-[720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-serif text-[18px] text-[var(--lk-ink)] no-underline">
            my<span className="text-gold">hinge</span>
          </Link>
          <p className="text-[13px] text-[var(--lk-faint)]">
            &copy; {new Date().getFullYear()} projscope.com
          </p>
          <Link href="/today" className="text-[13px] font-medium text-[var(--lk-ink)] no-underline hover:text-gold transition-colors">
            Open app →
          </Link>
        </div>
      </footer>
    </div>
  )
}
