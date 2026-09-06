export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  startAt: string // ISO 8601
  endAt: string // ISO 8601
  location?: string
  recurrenceRule?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
}
