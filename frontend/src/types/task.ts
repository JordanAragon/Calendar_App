export interface Task {
  id: string
  title: string
  description?: string
  dueAt?: string // ISO 8601
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}
