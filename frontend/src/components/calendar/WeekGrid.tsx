import type { ApiEvent } from '@/services/api'
import { addDays, formatTime, isSameDay, startOfWeek } from '@/utils/date'

interface Props {
  selected: Date
  events: ApiEvent[]
  onEdit: (event: ApiEvent) => void
}

export function WeekGrid({ selected, events, onEdit }: Props) {
  const start = startOfWeek(selected)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const hours = Array.from({ length: 15 }, (_, i) => i + 7)

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
          <div />
          {days.map((day) => (
            <div key={day.toISOString()} className={`py-2 text-center text-xs border-l border-border ${isSameDay(day, selected) ? 'font-semibold' : 'text-muted'}`}>
              {day.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')} {day.getDate()}
            </div>
          ))}
        </div>
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] min-h-16 border-b border-border last:border-b-0">
            <div className="font-mono text-[10px] text-muted px-2 py-2">{String(hour).padStart(2, '0')}:00</div>
            {days.map((day) => (
              <div key={day.toISOString()} className="border-l border-border p-1.5">
                {events.filter((event) => isSameDay(new Date(event.start_at), day) && new Date(event.start_at).getHours() === hour).map((event) => (
                  <button key={event.id} onClick={() => onEdit(event)} className="w-full text-left bg-surface rounded-md px-2 py-1.5 text-xs hover:bg-hover">
                    <span className="font-medium block truncate">{event.title}</span>
                    <span className="font-mono text-[10px] text-muted">{formatTime(event.start_at)}–{formatTime(event.end_at)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
