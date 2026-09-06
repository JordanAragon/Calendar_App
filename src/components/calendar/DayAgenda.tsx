import type { CalendarEvent } from '@/types/event'
import { formatTime } from '@/utils/date'

interface DayAgendaProps {
  events: CalendarEvent[]
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 07:00 - 21:00

export function DayAgenda({ events }: DayAgendaProps) {
  const eventsByHour = (hour: number) =>
    events.filter((e) => new Date(e.startAt).getHours() === hour)

  return (
    <div className="flex flex-col">
      {HOURS.map((hour) => {
        const hourEvents = eventsByHour(hour)
        return (
          <div key={hour} className="flex items-start gap-4 border-t border-border py-3 first:border-t-0">
            <span className="font-mono text-xs text-muted w-10 pt-0.5 shrink-0">
              {String(hour).padStart(2, '0')}
            </span>
            <div className="flex-1 flex flex-col gap-2 min-h-[1.5rem]">
              {hourEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-2 border-ink pl-3 py-1 bg-surface rounded-r-md"
                >
                  <p className="text-sm font-medium text-ink">{event.title}</p>
                  <p className="font-mono text-xs text-muted">
                    {formatTime(event.startAt)}–{formatTime(event.endAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
