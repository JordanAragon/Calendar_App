import { useCallback, useEffect, useMemo, useState } from 'react'
import { DayAgenda } from '@/components/calendar/DayAgenda'
import { WeekGrid } from '@/components/calendar/WeekGrid'
import { WeekStrip } from '@/components/calendar/WeekStrip'
import { EventModal } from '@/components/events/EventModal'
import { api, type ApiCalendar, type ApiEvent } from '@/services/api'
import { addDays, formatDayLabel, isSameDay, startOfWeek } from '@/utils/date'
import { Button } from '@/components/ui/Button'
import { scheduleEventNotifications } from '@/services/notifications'

function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function monthEnd(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 1) }

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date())
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [calendars, setCalendars] = useState<ApiCalendar[]>([])
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const from = view === 'month' ? monthStart(selected) : startOfWeek(selected)
      const to = view === 'month' ? monthEnd(selected) : addDays(startOfWeek(selected), 7)
      const [loadedEvents, loadedCalendars] = await Promise.all([api.getEvents(from, to), api.getCalendars()])
      setEvents(loadedEvents)
      setCalendars(loadedCalendars)
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo cargar el calendario.') }
    finally { setLoading(false) }
  }, [selected, view])

  useEffect(() => { void load() }, [load])
  useEffect(() => { const handler = () => void load(); window.addEventListener('calendar-data-change', handler); return () => window.removeEventListener('calendar-data-change', handler) }, [load])
  useEffect(() => scheduleEventNotifications(events), [events])

  const dayEvents = useMemo(() => events.filter((e) => isSameDay(new Date(e.start_at), selected)), [events, selected])

  async function saveEvent(payload: Parameters<typeof api.createEvent>[0]) {
    if (editing) await api.updateEvent(editing.id, payload)
    else await api.createEvent(payload)
    await load()
  }

  async function deleteEvent(id: string) { await api.deleteEvent(id); await load() }

  function shift(delta: number) {
    setSelected((current) => {
      const next = new Date(current)
      if (view === 'month') next.setMonth(next.getMonth() + delta)
      else next.setDate(next.getDate() + delta * (view === 'week' ? 7 : 1))
      return next
    })
  }

  return <div className="max-w-5xl">
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div><h1 className="font-display font-semibold text-xl capitalize">{formatDayLabel(selected)}</h1><p className="text-sm text-muted mt-1">{dayEvents.length === 0 ? 'Sin eventos' : `${dayEvents.length} eventos`}</p></div>
      <div className="flex items-center gap-2"><Button variant="secondary" onClick={() => setSelected(new Date())}>Hoy</Button><Button variant="secondary" onClick={() => shift(-1)} aria-label="Anterior">←</Button><Button variant="secondary" onClick={() => shift(1)} aria-label="Siguiente">→</Button><Button variant="primary" onClick={() => { setEditing(null); setModalOpen(true) }}>+ Evento</Button></div>
    </header>

    <div className="flex items-center justify-between mb-6"><WeekStrip selected={selected} onSelect={setSelected} /><div className="flex border border-border rounded-lg p-0.5"><button className={`px-2.5 py-1.5 text-xs rounded-md ${view === 'day' ? 'bg-ink text-white' : 'text-muted'}`} onClick={() => setView('day')}>Día</button><button className={`px-2.5 py-1.5 text-xs rounded-md ${view === 'week' ? 'bg-ink text-white' : 'text-muted'}`} onClick={() => setView('week')}>Semana</button><button className={`px-2.5 py-1.5 text-xs rounded-md ${view === 'month' ? 'bg-ink text-white' : 'text-muted'}`} onClick={() => setView('month')}>Mes</button></div></div>

    {error && <div className="mb-4 border border-red-200 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}
    {loading ? <p className="text-sm text-muted">Cargando eventos…</p> : view === 'month' ? <MonthView selected={selected} events={events} onSelect={(date) => { setSelected(date); setView('day') }} onEdit={(event) => { setEditing(event); setModalOpen(true) }} /> : view === 'week' ? <WeekGrid selected={selected} events={events} onEdit={(event) => { setEditing(event); setModalOpen(true) }} /> : <DayAgenda events={dayEvents} onEdit={(event) => { setEditing(event); setModalOpen(true) }} />}

    <EventModal open={modalOpen} calendars={calendars} event={editing} initialDate={selected} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={saveEvent} onDelete={deleteEvent} />
  </div>
}

function MonthView({ selected, events, onSelect, onEdit }: { selected: Date; events: ApiEvent[]; onSelect: (date: Date) => void; onEdit: (event: ApiEvent) => void }) {
  const start = startOfWeek(monthStart(selected))
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  return <div className="grid grid-cols-7 border-l border-t border-border rounded-lg overflow-hidden">{cells.map((day) => { const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day)); const currentMonth = day.getMonth() === selected.getMonth(); return <button key={day.toISOString()} onClick={() => onSelect(day)} className={`min-h-24 sm:min-h-28 text-left p-2 border-r border-b border-border hover:bg-hover ${currentMonth ? '' : 'opacity-40'}`}><span className="font-mono text-xs">{day.getDate()}</span><span className="block mt-1 space-y-1">{dayEvents.slice(0, 3).map((event) => <span key={event.id} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onEdit(event) }} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onEdit(event) } }} className="block truncate text-[11px] bg-surface rounded px-1.5 py-1">{event.title}</span>)}{dayEvents.length > 3 && <span className="text-[10px] text-muted">+{dayEvents.length - 3} más</span>}</span></button> })}</div>
}
