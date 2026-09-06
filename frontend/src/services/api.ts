const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8787'

export interface ApiEvent {
  id: string
  user_id: string
  calendar_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  recurrence_rule: string | null
  status: 'confirmed' | 'tentative' | 'cancelled'
}

export interface ApiTask {
  id: string
  user_id: string
  title: string
  description: string | null
  due_at: string | null
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

export interface ApiCalendar {
  id: string
  name: string
  color: string
}

let getAccessToken: (() => Promise<string | null>) | null = null
export function registerAccessTokenGetter(fn: () => Promise<string | null>) {
  getAccessToken = fn
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken ? await getAccessToken() : null
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error || `Request failed with ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  getMe: () => request<{ id: string; name: string; email: string; avatar_url?: string }>('/api/me'),
  getCalendars: () => request<ApiCalendar[]>('/api/calendars'),
  createCalendar: (payload: { name: string; color?: string }) => request<ApiCalendar>('/api/calendars', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCalendar: (id: string) => request<void>(`/api/calendars/${id}`, { method: 'DELETE' }),
  getEvents: (from?: Date, to?: Date) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from.toISOString())
    if (to) params.set('to', to.toISOString())
    return request<ApiEvent[]>(`/api/events?${params.toString()}`)
  },
  createEvent: (payload: { calendarId: string; title: string; description?: string | null; startAt: string; endAt: string; location?: string | null; recurrenceRule?: string | null }) =>
    request<ApiEvent>('/api/events', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvent: (id: string, payload: Partial<{ calendarId: string; title: string; description: string | null; startAt: string; endAt: string; location: string | null; recurrenceRule: string | null; status: ApiEvent['status'] }>) =>
    request<ApiEvent>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteEvent: (id: string) => request<void>(`/api/events/${id}`, { method: 'DELETE' }),
  getTasks: () => request<ApiTask[]>('/api/tasks'),
  createTask: (payload: { title: string; description?: string | null; dueAt?: string | null; priority?: ApiTask['priority']; completed?: boolean }) =>
    request<ApiTask>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: Partial<{ title: string; description: string | null; dueAt: string | null; priority: ApiTask['priority']; completed: boolean }>) =>
    request<ApiTask>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  ai: (message: string) => request<{ response: string; action: Record<string, unknown>; result: unknown }>('/api/ai/messages', {
    method: 'POST',
    body: JSON.stringify({ message, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
  })
}
