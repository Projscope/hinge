import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Focus Leaderboard — myhinge',
  description: 'See who is building the longest streaks and highest hit rates. One goal per day — ranked by consistency.',
  openGraph: {
    title: 'Focus Leaderboard — myhinge',
    description: 'See who is building the longest streaks and highest hit rates. One goal per day — ranked by consistency.',
    url: 'https://myhinge.app/leaderboard',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focus Leaderboard — myhinge',
    description: 'See who is building the longest streaks and highest hit rates. One goal per day — ranked by consistency.',
  },
  alternates: {
    canonical: 'https://myhinge.app/leaderboard',
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
