import type { ApiEvent } from '@/services/api'
import { formatTime } from '@/utils/date'

interface DayAgendaProps { events: ApiEvent[]; onEdit?: (event: ApiEvent) => void }
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)
export function DayAgenda({ events, onEdit }: DayAgendaProps) {
  const eventForHour = (hour: number) => events.filter((e) => new Date(e.start_at).getHours() === hour)
  return <div className="flex flex-col">{HOURS.map((hour) => { const hourEvents = eventForHour(hour); return <div key={hour} className="flex items-start gap-4 border-t border-border py-3 first:border-t-0"><span className="font-mono text-xs text-muted w-10 pt-0.5 shrink-0">{String(hour).padStart(2, '0')}:00</span><div className="flex-1 flex flex-col gap-2 min-h-[1.5rem]">{hourEvents.map((event) => <button key={event.id} onClick={() => onEdit?.(event)} className="text-left border-l-2 border-ink pl-3 py-2 bg-surface rounded-r-md hover:bg-hover"><p className="text-sm font-medium text-ink">{event.title}</p><p className="font-mono text-xs text-muted">{formatTime(event.start_at)}–{formatTime(event.end_at)}{event.location ? ` · ${event.location}` : ''}</p></button>)}</div></div> })}</div>
}
