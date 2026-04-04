const PREFS_KEY = 'hinge_notification_prefs'

export interface NotificationPrefs {
  morningEnabled: boolean
  morningTime: string // 'HH:MM'
  middayEnabled: boolean
  middayTime: string // 'HH:MM'
  eveningEnabled: boolean
  eveningTime: string // 'HH:MM'
}

const DEFAULT_PREFS: NotificationPrefs = {
  morningEnabled: false,
  morningTime: '08:00',
  middayEnabled: false,
  middayTime: '12:30',
  eveningEnabled: false,
  eveningTime: '20:00',
}

export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  scheduleNotifications(prefs)
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotifications(prefs: NotificationPrefs): void {
  if (typeof navigator === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATIONS',
        prefs,
      })
    }
  }).catch(() => {
    // SW not available — silently ignore
  })
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch {
    // Registration failed — silently ignore (e.g., in dev without HTTPS)
  }
}

export function showMiddayCheckIn(): void {
  scheduleNotifications(getNotificationPrefs())
}

export async function initNotifications(): Promise<void> {
  await registerServiceWorker()
  const prefs = getNotificationPrefs()
  if (prefs.morningEnabled || prefs.middayEnabled || prefs.eveningEnabled) {
    if (Notification.permission === 'granted') {
      scheduleNotifications(prefs)
    }
  }
}
