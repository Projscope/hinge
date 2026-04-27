import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'
import SwRegister from '@/components/SwRegister'
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

const BASE_URL = 'https://myhinge.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'myhinge — Stop managing tasks. Start finishing goals.',
    template: '%s — myhinge',
  },
  description:
    'One goal per day. Two support tasks. Hard 3-slot limit. The day hinges on one thing.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'myhinge',
  },
  openGraph: {
    title: 'myhinge — Stop managing tasks. Start finishing goals.',
    description: 'One goal per day. Two support tasks. Hard 3-slot limit. The day hinges on one thing.',
    url: BASE_URL,
    siteName: 'myhinge',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'myhinge — Stop managing tasks. Start finishing goals.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'myhinge — Stop managing tasks. Start finishing goals.',
    description: 'One goal per day. Two support tasks. Hard 3-slot limit. The day hinges on one thing.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: BASE_URL,
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
      </head>
      <body className="font-sans antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  )
}
