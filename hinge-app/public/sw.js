// myhinge Service Worker
// Handles push notifications + offline caching

const CACHE_NAME = 'myhinge-v1'

// Core app shell — cached on install for offline support
const PRECACHE_URLS = [
  '/',
  '/today',
  '/setup',
  '/queue',
  '/snapshot',
  '/offline',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip Supabase API calls — always network
  if (url.hostname.includes('supabase.co')) return

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(png|jpg|jpeg|svg|gif|webp|woff2?|ico)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Network-first for HTML pages — fall back to cache, then /offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline'))
      )
  )
})

// Track scheduled notification timers
const scheduledTimers = {}

function clearAllTimers() {
  Object.keys(scheduledTimers).forEach((key) => {
    clearTimeout(scheduledTimers[key])
    delete scheduledTimers[key]
  })
}

function msUntilTime(hhmm) {
  const now = new Date()
  const [hours, minutes] = hhmm.split(':').map(Number)
  const target = new Date(now)
  target.setHours(hours, minutes, 0, 0)
  // If the time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

function showMorningNotification() {
  self.registration.showNotification('Good morning — what matters today?', {
    body: 'Set your single most important goal for the day.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'hinge-morning',
    renotify: true,
    data: { url: '/setup' },
  })
}

function showMiddayNotification() {
  self.registration.showNotification('Still on track?', {
    body: 'Quick check — is your goal still happening today?',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'hinge-midday',
    renotify: true,
    actions: [
      { action: 'yes', title: '✓ On track' },
      { action: 'no', title: '⚠ Off track' },
    ],
    data: { url: '/checkin' },
  })
}

function showEveningNotification() {
  self.registration.showNotification("Don't forget to close your day", {
    body: 'Review your progress and mark your goal as achieved or missed.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'hinge-evening',
    renotify: true,
    data: { url: '/snapshot' },
  })
}

function scheduleRepeating(key, notifFn, hhmm) {
  const delay = msUntilTime(hhmm)
  scheduledTimers[key] = setTimeout(() => {
    notifFn()
    // Reschedule for next day (24 hours later)
    scheduleRepeating(key, notifFn, hhmm)
  }, delay)
}

self.addEventListener('message', (event) => {
  const { type, prefs } = event.data || {}

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    clearAllTimers()

    if (!prefs) return

    if (prefs.morningEnabled && prefs.morningTime) {
      scheduleRepeating('morning', showMorningNotification, prefs.morningTime)
    }

    if (prefs.middayEnabled && prefs.middayTime) {
      scheduleRepeating('midday', showMiddayNotification, prefs.middayTime)
    }

    if (prefs.eveningEnabled && prefs.eveningTime) {
      scheduleRepeating('evening', showEveningNotification, prefs.eveningTime)
    }
  }

  if (type === 'CLEAR_NOTIFICATIONS') {
    clearAllTimers()
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Mid-day check-in action handling
  if (event.notification.tag === 'hinge-midday') {
    if (event.action === 'yes') {
      // User is on track — just close the notification, no navigation needed
      return
    }
    // action === 'no' or default click → navigate to /checkin
    const checkinUrl = '/checkin'
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) {
              return client.navigate(checkinUrl)
            }
            return
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(checkinUrl)
        }
      })
    )
    return
  }

  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client) {
            return client.navigate(url)
          }
          return
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
