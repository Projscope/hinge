import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Proxy endpoint so the browser can download the PNG without CORS issues.
// The <a download> attribute is silently ignored for cross-origin URLs —
// fetching via same-origin and re-streaming solves that.
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('u')
  if (!username) return new Response('Missing username', { status: 400 })

  const pngUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/og-images/${username}.png`

  const upstream = await fetch(pngUrl)
  if (!upstream.ok) return new Response('Image not found', { status: 404 })

  const buffer = await upstream.arrayBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
