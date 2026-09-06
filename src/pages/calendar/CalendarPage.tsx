import { useState } from 'react'
import { WeekStrip } from '@/components/calendar/WeekStrip'
import { DayAgenda } from '@/components/calendar/DayAgenda'
import { mockEvents } from '@/services/mock-data'
import { formatDayLabel, isSameDay } from '@/utils/date'

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date())
  const dayEvents = mockEvents.filter((e) => isSameDay(new Date(e.startAt), selected))

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display font-semibold text-xl capitalize">
          {formatDayLabel(selected)}
        </h1>
        <p className="text-sm text-muted mt-1">
          {dayEvents.length === 0 ? 'Sin eventos' : `${dayEvents.length} eventos`}
        </p>
      </header>

      <div className="mb-8">
        <WeekStrip selected={selected} onSelect={setSelected} />
      </div>

      <DayAgenda events={dayEvents} />
    </div>
  )
}
