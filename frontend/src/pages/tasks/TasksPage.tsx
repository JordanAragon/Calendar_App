import { useCallback, useEffect, useState } from 'react'
import { api, type ApiTask } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { TaskModal } from '@/components/tasks/TaskModal'

const priorityLabel: Record<ApiTask['priority'], string> = { high: 'Alta', medium: 'Media', low: 'Baja' }
export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ApiTask | null>(null)
  const load = useCallback(async () => { setLoading(true); try { setTasks(await api.getTasks()); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron cargar las tareas.') } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  async function toggle(id: string, completed: boolean) { await api.updateTask(id, { completed: !completed }); await load() }
  async function save(payload: Parameters<typeof api.createTask>[0]) { if (editing) await api.updateTask(editing.id, payload); else await api.createTask(payload); await load() }
  async function remove(id: string) { await api.deleteTask(id); await load() }
  return <div className="max-w-3xl"><header className="flex items-center justify-between mb-6"><div><h1 className="font-display font-semibold text-xl">Tareas</h1><p className="text-sm text-muted mt-1">{tasks.filter((t) => !t.completed).length} pendientes</p></div><Button variant="primary" onClick={() => { setEditing(null); setOpen(true) }}>+ Tarea</Button></header>{error && <div className="mb-4 border border-red-200 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}{loading ? <p className="text-sm text-muted">Cargando tareas…</p> : <ul className="flex flex-col border-t border-border">{tasks.map((task) => <li key={task.id} className="flex items-center gap-3 border-b border-border py-3"><button onClick={() => void toggle(task.id, task.completed)} aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'} className={`w-4 h-4 rounded-full border shrink-0 ${task.completed ? 'bg-ink border-ink' : 'border-muted'}`} /><button onClick={() => { setEditing(task); setOpen(true) }} className={`flex-1 text-left text-sm ${task.completed ? 'line-through text-muted' : 'text-ink'}`}>{task.title}<span className="block text-[11px] text-muted mt-0.5">{task.due_at ? new Date(task.due_at).toLocaleString('es-CO') : 'Sin fecha'}</span></button><span className="font-mono text-[10px] uppercase text-muted">{priorityLabel[task.priority]}</span></li>)}</ul>}<TaskModal open={open} task={editing} onClose={() => { setOpen(false); setEditing(null) }} onSave={save} onDelete={remove} /></div>
}
