import type { CalendarEvent } from '@/types/event'
import type { Task } from '@/types/task'

const today = new Date()
const iso = (h: number, m = 0, dayOffset = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const mockEvents: CalendarEvent[] = [
  {
    id: 'e1',
    calendarId: 'personal',
    title: 'Bases de datos',
    startAt: iso(8, 0),
    endAt: iso(10, 0),
    status: 'confirmed'
  },
  {
    id: 'e2',
    calendarId: 'personal',
    title: 'Reunión de equipo',
    startAt: iso(11, 0),
    endAt: iso(11, 45),
    status: 'confirmed'
  },
  {
    id: 'e3',
    calendarId: 'personal',
    title: 'Estudiar Python',
    startAt: iso(19, 0, 1),
    endAt: iso(21, 0, 1),
    status: 'confirmed'
  }
]

export const mockTasks: Task[] = [
  { id: 't1', title: 'Pagar internet', priority: 'medium', completed: false },
  { id: 't2', title: 'Entregar informe de cálculo', priority: 'high', completed: false },
  { id: 't3', title: 'Revisar correo de la universidad', priority: 'low', completed: true }
]
