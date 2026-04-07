import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/leaderboard', '/u/', '/share/'],
        disallow: [
          '/today',
          '/setup',
          '/snapshot',
          '/queue',
          '/history',
          '/insights',
          '/milestones',
          '/settings',
          '/checkin',
          '/offline',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://myhinge.app/sitemap.xml',
  }
}
