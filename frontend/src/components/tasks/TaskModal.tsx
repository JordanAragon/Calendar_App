import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ApiTask } from '@/services/api'

interface Props { open: boolean; task?: ApiTask | null; onClose: () => void; onSave: (payload: { title: string; description?: string | null; dueAt?: string | null; priority: ApiTask['priority']; completed?: boolean }) => Promise<void>; onDelete?: (id: string) => Promise<void> }

function toLocalDateTime(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16)
}

export function TaskModal({ open, task, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<ApiTask['priority']>('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setDueAt(toLocalDateTime(task?.due_at))
    setPriority(task?.priority ?? 'medium')
    setError('')
  }, [open, task])
  if (!open) return null

  async function save() {
    if (!title.trim()) return setError('El título es obligatorio.')
    setSaving(true); setError('')
    try { await onSave({ title: title.trim(), description: description.trim() || null, dueAt: dueAt ? new Date(dueAt).toISOString() : null, priority }); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.') }
    finally { setSaving(false) }
  }
  async function remove() { if (!task || !onDelete) return; setSaving(true); try { await onDelete(task.id); onClose() } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar.') } finally { setSaving(false) } }

  return <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true"><div className="w-full sm:max-w-lg bg-bg border border-border rounded-t-xl sm:rounded-xl p-5 shadow-xl">
    <div className="flex items-center justify-between mb-5"><h2 className="font-display font-semibold">{task ? 'Editar tarea' : 'Nueva tarea'}</h2><button aria-label="Cerrar" onClick={onClose} className="text-muted hover:text-ink">×</button></div>
    <div className="grid gap-3"><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="border border-border rounded-lg px-3 py-2 text-sm bg-bg" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" rows={3} className="border border-border rounded-lg px-3 py-2 text-sm bg-bg resize-none" /><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs text-muted">Vencimiento<input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-bg" /></label><label className="text-xs text-muted">Prioridad<select value={priority} onChange={(e) => setPriority(e.target.value as ApiTask['priority'])} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-bg"><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></label></div></div>
    {error && <p className="text-xs text-red-600 mt-3">{error}</p>}<div className="mt-5 flex justify-between"><div>{task && onDelete && <Button variant="danger" disabled={saving} onClick={remove}>Eliminar</Button>}</div><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar'}</Button></div></div>
  </div></div>
}
