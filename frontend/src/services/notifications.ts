import type { ApiEvent } from './api'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported' as const
  if (Notification.permission === 'granted') return 'granted' as const
  return Notification.requestPermission()
}

export function scheduleEventNotifications(events: ApiEvent[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return () => {}
  const timers = events.map((event) => {
    const delay = new Date(event.start_at).getTime() - Date.now() - 5 * 60 * 1000
    if (delay <= 0) return null
    return window.setTimeout(() => {
      new Notification(`Próximo: ${event.title}`, { body: `Empieza a las ${new Date(event.start_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` })
    }, Math.min(delay, 2147483647))
  }).filter((id): id is number => id !== null)
  return () => timers.forEach(window.clearTimeout)
}
