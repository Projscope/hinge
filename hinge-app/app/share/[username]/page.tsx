import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://myhinge.app'

interface Props {
  params: Promise<{ username: string }>
}

async function getProfile(username: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('public_profiles')
    .select('display_name, username')
    .eq('username', username.toLowerCase())
    .eq('is_public', true)
    .maybeSingle()

  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    return { title: 'Profile not found — myhinge' }
  }

  const displayName = profile.display_name || profile.username
  const ogImage = `${BASE_URL}/api/og/streak?u=${username}`
  const title = `${displayName} is on a streak 🔥`
  const description = 'One goal per day. Every day. See their streak on myhinge.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/share/${username}`,
      siteName: 'myhinge',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0e0c] flex items-center justify-center">
        <p className="text-[rgba(245,242,234,0.4)] text-[15px]">Profile not found.</p>
      </div>
    )
  }

  const displayName = profile.display_name || profile.username

  return (
    <div className="min-h-screen bg-[#0f0e0c] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <p className="font-serif text-[22px] mb-8">
        <span style={{ color: 'rgba(245,242,234,0.7)' }}>my</span>
        <span style={{ color: '#c8922a' }}>hinge</span>
      </p>

      {/* Card preview */}
      <div className="w-full max-w-sm rounded-[16px] overflow-hidden border border-[rgba(200,146,42,0.2)] mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/og/streak?u=${username}`}
          alt={`${displayName}'s streak`}
          className="w-full"
        />
      </div>

      <p className="text-[rgba(245,242,234,0.5)] text-[14px] mb-6">
        {displayName} is building a daily streak on myhinge.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[220px]">
        <Link
          href={`/u/${username}`}
          className="bg-[#c8922a] text-[#0f0e0c] text-[13px] font-semibold py-3 px-6 rounded-[10px] no-underline text-center hover:opacity-90 transition-opacity"
        >
          View full profile →
        </Link>
        <Link
          href="/"
          className="text-[rgba(245,242,234,0.4)] text-[12px] no-underline hover:text-[rgba(245,242,234,0.7)] transition-colors"
        >
          What is myhinge?
        </Link>
      </div>
    </div>
  )
}
