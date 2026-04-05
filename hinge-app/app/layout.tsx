import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'myhinge — Stop managing tasks. Start finishing goals.',
  description:
    'One goal per day. Two support tasks. Hard 3-slot limit. The day hinges on one thing.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'myhinge',
  },
  openGraph: {
    title: 'myhinge',
    description: 'Stop managing tasks. Start finishing goals.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#0f0e0c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
