// Server component — allows route segment config to take effect.
// All interactive logic lives in AppShell (client component).
export const dynamic = 'force-dynamic'

import AppShell from '@/components/layout/AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
