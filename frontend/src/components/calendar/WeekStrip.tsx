import { addDays, isSameDay, startOfWeek } from '@/utils/date'

interface WeekStripProps {
  selected: Date
  onSelect: (date: Date) => void
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function WeekStrip({ selected, onSelect }: WeekStripProps) {
  const start = startOfWeek(selected)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="flex gap-1">
      {days.map((day, i) => {
        const active = isSameDay(day, selected)
        return (
          <button
            key={i}
            onClick={() => onSelect(day)}
            className={`flex flex-col items-center w-11 py-2 rounded-md transition-colors ${
              active ? 'bg-ink text-white' : 'hover:bg-hover text-ink'
            }`}
          >
            <span className="text-[10px] uppercase text-current opacity-60">{DAY_LABELS[i]}</span>
            <span className="font-mono text-sm">{day.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
