import { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
  const title = `${displayName} is building a streak on myhinge 🔥`
  const description = 'One goal per day. Every day. See their streak and join the accountability.'

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
  // Redirect to the full public profile page
  redirect(`/u/${username}`)
}
