import { useState } from 'react'
import type { AiMessage } from '@/types/ai'
import { Button } from '@/components/ui/Button'
import { api } from '@/services/api'

const initialMessages: AiMessage[] = [{ id: 'm0', role: 'assistant', content: '¿Qué puedo agendar por ti?' }]

export function AiAssistantPanel() {
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setError(''); setInput(''); setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]); setLoading(true)
    try {
      const result = await api.ai(text)
      const pending = result.action.requiresConfirmation === true && (result.action.action === 'delete_event' || result.action.action === 'delete_task')
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: result.response, requiresConfirmation: pending, pendingAction: pending ? { type: result.action.action === 'delete_event' ? 'delete_event' : 'delete_task', id: String(result.action.eventId ?? result.action.taskId ?? ''), label: result.action.action === 'delete_event' ? 'Eliminar evento' : 'Eliminar tarea' } : undefined }])
      window.dispatchEvent(new Event('calendar-data-change'))
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo procesar la solicitud.'); setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'No pude procesar esa solicitud. Revisa la conexión y vuelve a intentarlo.' }]) }
    finally { setLoading(false) }
  }
  async function confirm(message: AiMessage) {
    const pending = message.pendingAction; if (!pending?.id) return
    try { if (pending.type === 'delete_event') await api.deleteEvent(pending.id); else await api.deleteTask(pending.id); setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, requiresConfirmation: false, content: 'Listo. La acción fue ejecutada.' } : m)); window.dispatchEvent(new Event('calendar-data-change')) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo ejecutar la acción.') }
  }
  function cancel(messageId: string) { setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, requiresConfirmation: false, content: 'Acción cancelada.' } : m)) }

  const panel = <div className="flex h-full flex-col"><div className="px-4 py-4 border-b border-border"><span className="font-display font-semibold text-sm">Asistente</span><p className="text-[11px] text-muted mt-1">Lenguaje natural para gestionar tu agenda.</p></div><div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">{messages.map((message) => <MessageBubble key={message.id} message={message} onConfirm={() => void confirm(message)} onCancel={() => cancel(message.id)} />)}{loading && <div className="self-start bg-surface text-muted px-3 py-2 rounded-lg text-sm">Pensando…</div>}</div><div className="p-3 border-t border-border"><div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2"><input aria-label="Mensaje para el asistente" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void handleSend()} placeholder="Escribe una solicitud…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" /><Button aria-label="Enviar" variant="primary" disabled={loading} onClick={() => void handleSend()} className="px-2 py-1">↑</Button></div>{error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}</div></div>

  return <>
    <aside className="hidden lg:block w-80 shrink-0 border-l border-border h-screen sticky top-0">{panel}</aside>
    <button onClick={() => setMobileOpen(true)} aria-label="Abrir asistente" className="lg:hidden fixed right-4 bottom-20 z-40 rounded-full bg-ink text-white w-12 h-12 shadow-lg">✦</button>
    {mobileOpen && <div className="lg:hidden fixed inset-0 z-50 bg-bg"><div className="h-full"><div className="absolute top-3 right-3 z-10"><Button variant="secondary" onClick={() => setMobileOpen(false)}>Cerrar</Button></div>{panel}</div></div>}
  </>
}

function MessageBubble({ message, onConfirm, onCancel }: { message: AiMessage; onConfirm: () => void; onCancel: () => void }) {
  const isUser = message.role === 'user'
  return <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}><div className={`max-w-[90%] whitespace-pre-wrap px-3 py-2 rounded-lg text-sm ${isUser ? 'bg-ink text-white' : 'bg-surface text-ink'}`}>{message.content}</div>{message.requiresConfirmation && message.pendingAction && <div className="flex gap-2 mt-2"><Button variant="secondary" onClick={onCancel}>Cancelar</Button><Button variant="danger" onClick={onConfirm}>{message.pendingAction.label}</Button></div>}</div>
}
