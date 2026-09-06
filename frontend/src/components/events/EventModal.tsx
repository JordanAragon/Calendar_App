import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ApiCalendar, ApiEvent } from '@/services/api'

interface Props {
  open: boolean
  calendars: ApiCalendar[]
  event?: ApiEvent | null
  initialDate?: Date
  onClose: () => void
  onSave: (payload: { calendarId: string; title: string; description?: string | null; startAt: string; endAt: string; location?: string | null; recurrenceRule?: string | null }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

function toLocalInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16)
}

export function EventModal({ open, calendars, event, initialDate, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [location, setLocation] = useState('')
  const [calendarId, setCalendarId] = useState('')
  const [recurrenceRule, setRecurrenceRule] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const base = initialDate ? new Date(initialDate) : new Date()
    base.setHours(9, 0, 0, 0)
    const end = new Date(base)
    end.setHours(10)
    setTitle(event?.title ?? '')
    setDescription(event?.description ?? '')
    setStartAt(toLocalInput(event?.start_at ?? base.toISOString()))
    setEndAt(toLocalInput(event?.end_at ?? end.toISOString()))
    setLocation(event?.location ?? '')
    setCalendarId(event?.calendar_id ?? calendars[0]?.id ?? '')
    setRecurrenceRule(event?.recurrence_rule ?? '')
    setError('')
  }, [open, event, initialDate, calendars])

  if (!open) return null

  async function save() {
    if (!title.trim()) return setError('El título es obligatorio.')
    if (!calendarId) return setError('Crea un calendario en Supabase antes de crear eventos.')
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (!(end > start)) return setError('La hora final debe ser posterior a la inicial.')
    setSaving(true)
    setError('')
    try {
      await onSave({ calendarId, title: title.trim(), description: description.trim() || null, startAt: start.toISOString(), endAt: end.toISOString(), location: location.trim() || null, recurrenceRule: recurrenceRule || null })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el evento.')
    } finally { setSaving(false) }
  }

  async function remove() {
    if (!event || !onDelete) return
    if (!window.confirm(`¿Eliminar el evento "${event.title}"?`)) return
    setSaving(true)
    try { await onDelete(event.id); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full sm:max-w-lg bg-bg border border-border rounded-t-xl sm:rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold">{event ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button aria-label="Cerrar" onClick={onClose} className="text-muted hover:text-ink">×</button>
        </div>
        <div className="grid gap-3">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="border border-border rounded-lg px-3 py-2 text-sm bg-bg" />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs text-muted">Inicio<input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-bg text-ink" /></label>
            <label className="text-xs text-muted">Fin<input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-bg text-ink" /></label>
          </div>
          <select value={calendarId} onChange={(e) => setCalendarId(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-bg">
            {calendars.map((calendar) => <option key={calendar.id} value={calendar.id}>{calendar.name}</option>)}
          </select>
          <select value={recurrenceRule} onChange={(e) => setRecurrenceRule(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-bg"><option value="">Sin repetición</option><option value="FREQ=DAILY">Cada día</option><option value="FREQ=WEEKLY">Cada semana</option><option value="FREQ=MONTHLY">Cada mes</option></select>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ubicación (opcional)" className="border border-border rounded-lg px-3 py-2 text-sm bg-bg" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" rows={3} className="border border-border rounded-lg px-3 py-2 text-sm bg-bg resize-none" />
        </div>
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        <div className="mt-5 flex justify-between gap-2">
          <div>{event && onDelete && <Button variant="danger" disabled={saving} onClick={remove}>Eliminar</Button>}</div>
          <div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar'}</Button></div>
        </div>
      </div>
    </div>
  )
}
