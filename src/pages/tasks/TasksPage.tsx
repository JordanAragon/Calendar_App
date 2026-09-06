import { useState } from 'react'
import { mockTasks } from '@/services/mock-data'
import type { Task } from '@/types/task'

const priorityLabel: Record<Task['priority'], string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-semibold text-xl mb-6">Tareas</h1>
      <ul className="flex flex-col">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 border-t border-border py-3 first:border-t-0"
          >
            <button
              onClick={() => toggle(task.id)}
              aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              className={`w-4 h-4 rounded-full border shrink-0 ${
                task.completed ? 'bg-ink border-ink' : 'border-muted'
              }`}
            />
            <span
              className={`flex-1 text-sm ${
                task.completed ? 'line-through text-muted' : 'text-ink'
              }`}
            >
              {task.title}
            </span>
            <span className="font-mono text-[10px] uppercase text-muted">
              {priorityLabel[task.priority]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
