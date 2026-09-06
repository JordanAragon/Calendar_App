import { useState } from 'react'
import type { AiMessage } from '@/types/ai'
import { Button } from '@/components/ui/Button'

const initialMessages: AiMessage[] = [
  {
    id: 'm0',
    role: 'assistant',
    content: '¿Qué puedo agendar por ti?'
  }
]

export function AiAssistantPanel() {
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages)
  const [input, setInput] = useState('')

  function handleSend() {
    if (!input.trim()) return
    const userMessage: AiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    // TODO: reemplazar por llamada real a POST /ai/messages cuando exista el backend
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-80 shrink-0 border-l border-border h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-border">
        <span className="font-display font-semibold text-sm">Asistente</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un evento..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <Button variant="primary" onClick={handleSend} className="px-2 py-1">
            ↑
          </Button>
        </div>
      </div>
    </aside>
  )
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
          isUser ? 'bg-ink text-white' : 'bg-surface text-ink'
        }`}
      >
        {message.content}
      </div>
      {message.requiresConfirmation && message.pendingAction && (
        <div className="flex gap-2 mt-2">
          <Button variant="secondary">Cancelar</Button>
          <Button variant="danger">{message.pendingAction.label}</Button>
        </div>
      )}
    </div>
  )
}
