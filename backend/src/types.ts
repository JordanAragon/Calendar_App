export type EventStatus = 'confirmed' | 'tentative' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high'

export interface DatabaseEvent {
  id: string
  calendar_id: string
  user_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  recurrence_rule: string | null
  status: EventStatus
}

export interface DatabaseTask {
  id: string
  user_id: string
  title: string
  description: string | null
  due_at: string | null
  priority: Priority
  completed: boolean
}
