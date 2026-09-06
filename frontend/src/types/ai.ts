export type AiMessageRole = 'user' | 'assistant'
export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  requiresConfirmation?: boolean
  pendingAction?: { type: 'delete_event' | 'delete_task'; id: string; label: string }
}
