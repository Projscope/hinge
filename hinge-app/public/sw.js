// Hin.ge Service Worker
// Handles scheduled push notifications via postMessage + setTimeout

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
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
