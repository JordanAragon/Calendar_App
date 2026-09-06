import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { api, type ApiCalendar } from '@/services/api'
import { requestNotificationPermission } from '@/services/notifications'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default')
  const [calendars, setCalendars] = useState<ApiCalendar[]>([])
  const [calendarName, setCalendarName] = useState('')
  const [calendarError, setCalendarError] = useState('')

  async function loadCalendars() {
    try { setCalendars(await api.getCalendars()) } catch (err) { setCalendarError(err instanceof Error ? err.message : 'No se pudieron cargar los calendarios.') }
  }

  useEffect(() => {
    if (!('Notification' in window)) setPermission('unsupported')
    else setPermission(Notification.permission)
    void loadCalendars()
  }, [])

  async function addCalendar() {
    if (!calendarName.trim()) return
    setCalendarError('')
    try { await api.createCalendar({ name: calendarName.trim() }); setCalendarName(''); await loadCalendars() }
    catch (err) { setCalendarError(err instanceof Error ? err.message : 'No se pudo crear el calendario.') }
  }

  async function removeCalendar(id: string) {
    if (!window.confirm('¿Eliminar este calendario y sus eventos?')) return
    try { await api.deleteCalendar(id); await loadCalendars() }
    catch (err) { setCalendarError(err instanceof Error ? err.message : 'No se pudo eliminar.') }
  }

  return <div className="max-w-2xl">
    <h1 className="font-display font-semibold text-xl mb-6">Ajustes</h1>
    <section className="border-t border-border py-5">
      <h2 className="font-medium text-sm">Cuenta</h2>
      <div className="mt-3 flex items-center justify-between gap-4"><div><p className="text-sm">{user?.name || 'Usuario'}</p><p className="text-xs text-muted">{user?.email}</p></div><Button variant="danger" onClick={() => void signOut()}>Cerrar sesión</Button></div>
    </section>
    <section className="border-t border-border py-5">
      <h2 className="font-medium text-sm">Calendarios</h2>
      <div className="mt-3 space-y-2">{calendars.map((calendar) => <div key={calendar.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2"><span className="text-sm">{calendar.name}</span>{calendars.length > 1 && <button className="text-xs text-red-600" onClick={() => void removeCalendar(calendar.id)}>Eliminar</button>}</div>)}<div className="flex gap-2"><input value={calendarName} onChange={(e) => setCalendarName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void addCalendar()} placeholder="Nuevo calendario" className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-bg" /><Button variant="secondary" onClick={() => void addCalendar()}>Crear</Button></div>{calendarError && <p className="text-xs text-red-600">{calendarError}</p>}</div>
    </section>
    <section className="border-t border-border py-5">
      <h2 className="font-medium text-sm">Preferencias</h2>
      <div className="mt-3 grid gap-3 text-sm">
        <div className="flex items-center justify-between"><span>Zona horaria</span><span className="font-mono text-xs text-muted">{timezone}</span></div>
        <div className="flex items-center justify-between"><span>Recordatorios <span className="block text-[11px] text-muted">{permission === 'granted' ? 'Permiso concedido' : permission === 'denied' ? 'Bloqueadas por el navegador' : permission === 'unsupported' ? 'No compatible' : 'Notificación 5 min antes'}</span></span><button disabled={permission === 'unsupported'} aria-pressed={notifications} onClick={() => { setNotifications((v) => !v); if ('Notification' in window && Notification.permission !== 'granted') void requestNotificationPermission().then(setPermission) }} className={`w-10 h-6 rounded-full p-1 transition ${notifications ? 'bg-ink' : 'bg-surface border border-border'}`}><span className={`block w-4 h-4 rounded-full bg-white transition ${notifications ? 'translate-x-4' : ''}`} /></button></div>
      </div>
    </section>
    <section className="border-t border-border py-5"><h2 className="font-medium text-sm">Sobre la aplicación</h2><p className="mt-2 text-sm text-muted leading-6">Calendar combina una agenda persistente con un asistente de lenguaje natural conectado a Gemini. La clave de IA vive únicamente en el backend.</p></section>
  </div>
}
