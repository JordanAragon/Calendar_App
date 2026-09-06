import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { z } from 'zod'
import { interpretCommand } from './ai.js'
import { getSupabaseForRequest, requireUser } from './supabase.js'

const app = express()
const port = Number(process.env.PORT || 8787)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: clientOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))

const eventCreateInput = z.object({
  calendarId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }),
  location: z.string().max(500).optional().nullable(),
  recurrenceRule: z.string().max(500).optional().nullable(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed')
}).refine((v) => new Date(v.endAt) > new Date(v.startAt), { message: 'endAt must be after startAt' })

const eventPatchInput = z.object({
  calendarId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  startAt: z.string().datetime({ offset: true }).optional(),
  endAt: z.string().datetime({ offset: true }).optional(),
  location: z.string().max(500).optional().nullable(),
  recurrenceRule: z.string().max(500).optional().nullable(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional()
})

const taskInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  completed: z.boolean().default(false)
})

function respondError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const status = message === 'UNAUTHENTICATED' ? 401 : 400
  res.status(status).json({ error: message })
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'calendar-backend' }))

app.get('/api/me', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    const metadata = user.user_metadata ?? {}
    const { data, error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: String(metadata.full_name ?? metadata.name ?? ''),
      email: user.email ?? '',
      avatar_url: metadata.avatar_url ? String(metadata.avatar_url) : null
    }).select('id,name,email,avatar_url').single()
    if (error) throw error
    res.json({ ...data })
  } catch (error) { respondError(error, res) }
})

app.get('/api/calendars', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    let { data, error } = await supabase.from('calendars').select('id,name,color').order('created_at')
    if (error) throw error
    if (!data?.length) {
      const created = await supabase.from('calendars').insert({ user_id: user.id, name: 'Personal', color: '#111111' }).select('id,name,color').single()
      if (created.error) throw created.error
      data = [created.data]
    }
    res.json(data ?? [])
  } catch (error) { respondError(error, res) }
})


const calendarInput = z.object({ name: z.string().min(1).max(80), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#111111') })

app.post('/api/calendars', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    const parsed = calendarInput.parse(req.body)
    const { data, error } = await supabase.from('calendars').insert({ user_id: user.id, name: parsed.name, color: parsed.color }).select('id,name,color').single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { respondError(error, res) }
})

app.delete('/api/calendars/:id', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const { count, error: countError } = await supabase.from('calendars').select('id', { count: 'exact', head: true })
    if (countError) throw countError
    if ((count ?? 0) <= 1) throw new Error('Debes conservar al menos un calendario.')
    const { error } = await supabase.from('calendars').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (error) { respondError(error, res) }
})

app.get('/api/events', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const from = typeof req.query.from === 'string' ? req.query.from : new Date().toISOString()
    const to = typeof req.query.to === 'string' ? req.query.to : new Date(Date.now() + 31 * 86400000).toISOString()
    const { data, error } = await supabase.from('events').select('*').lt('start_at', to).gt('end_at', from).order('start_at')
    if (error) throw error
    res.json(data ?? [])
  } catch (error) { respondError(error, res) }
})

app.post('/api/events', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    const parsed = eventCreateInput.parse(req.body)
    const { data, error } = await supabase.from('events').insert({
      user_id: user.id,
      calendar_id: parsed.calendarId,
      title: parsed.title,
      description: parsed.description ?? null,
      start_at: parsed.startAt,
      end_at: parsed.endAt,
      location: parsed.location ?? null,
      recurrence_rule: parsed.recurrenceRule ?? null,
      status: parsed.status
    }).select('*').single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { respondError(error, res) }
})

app.patch('/api/events/:id', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const parsed = eventPatchInput.parse(req.body)
    const patch: Record<string, unknown> = {}
    if (parsed.calendarId !== undefined) patch.calendar_id = parsed.calendarId
    if (parsed.title !== undefined) patch.title = parsed.title
    if (parsed.description !== undefined) patch.description = parsed.description
    if (parsed.startAt !== undefined) patch.start_at = parsed.startAt
    if (parsed.endAt !== undefined) patch.end_at = parsed.endAt
    if (parsed.location !== undefined) patch.location = parsed.location
    if (parsed.recurrenceRule !== undefined) patch.recurrence_rule = parsed.recurrenceRule
    if (parsed.status !== undefined) patch.status = parsed.status
    if (patch.start_at && patch.end_at && new Date(String(patch.end_at)) <= new Date(String(patch.start_at))) throw new Error('endAt must be after startAt')
    const { data, error } = await supabase.from('events').update(patch).eq('id', req.params.id).select('*').single()
    if (error) throw error
    res.json(data)
  } catch (error) { respondError(error, res) }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const { error } = await supabase.from('events').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (error) { respondError(error, res) }
})

app.get('/api/tasks', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const { data, error } = await supabase.from('tasks').select('*').order('completed').order('due_at', { ascending: true, nullsFirst: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (error) { respondError(error, res) }
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    const parsed = taskInput.parse(req.body)
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description ?? null,
      due_at: parsed.dueAt ?? null,
      priority: parsed.priority,
      completed: parsed.completed
    }).select('*').single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { respondError(error, res) }
})

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const parsed = taskInput.partial().parse(req.body)
    const patch: Record<string, unknown> = {}
    if (parsed.title !== undefined) patch.title = parsed.title
    if (parsed.description !== undefined) patch.description = parsed.description
    if (parsed.dueAt !== undefined) patch.due_at = parsed.dueAt
    if (parsed.priority !== undefined) patch.priority = parsed.priority
    if (parsed.completed !== undefined) patch.completed = parsed.completed
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', req.params.id).select('*').single()
    if (error) throw error
    res.json(data)
  } catch (error) { respondError(error, res) }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { supabase } = await requireUser(req)
    const { error } = await supabase.from('tasks').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).send()
  } catch (error) { respondError(error, res) }
})

app.post('/api/ai/messages', async (req, res) => {
  try {
    const { supabase, user } = await requireUser(req)
    const body = z.object({ message: z.string().min(1).max(2000), timezone: z.string().default('UTC') }).parse(req.body)
    const now = new Date().toISOString()
    const [eventsResult, tasksResult] = await Promise.all([
      supabase.from('events').select('id,title,start_at,end_at,location,status').order('start_at').limit(100),
      supabase.from('tasks').select('id,title,due_at,priority,completed').order('completed').limit(100)
    ])
    if (eventsResult.error) throw eventsResult.error
    if (tasksResult.error) throw tasksResult.error

    const action = await interpretCommand(body.message, {
      now,
      timezone: body.timezone,
      events: eventsResult.data ?? [],
      tasks: tasksResult.data ?? []
    })

    await supabase.from('ai_messages').insert([{ user_id: user.id, role: 'user', content: body.message }])

    let response = action.response
    let result: unknown = null

    if (action.action === 'create_event') {
      const calendars = await supabase.from('calendars').select('id').order('created_at').limit(1)
      if (calendars.error) throw calendars.error
      const calendarId = calendars.data?.[0]?.id
      if (!calendarId || !action.title || !action.startAt || !action.endAt) throw new Error('AI could not determine enough event data')
      const inserted = await supabase.from('events').insert({
        user_id: user.id,
        calendar_id: calendarId,
        title: action.title,
        description: action.description,
        start_at: action.startAt,
        end_at: action.endAt,
        location: action.location,
        recurrence_rule: action.recurrenceRule,
        status: 'confirmed'
      }).select('*').single()
      if (inserted.error) throw inserted.error
      result = inserted.data
    }

    if (action.action === 'create_task') {
      if (!action.title) throw new Error('AI could not determine the task title')
      const inserted = await supabase.from('tasks').insert({
        user_id: user.id,
        title: action.title,
        description: action.description,
        due_at: action.startAt,
        priority: action.priority ?? 'medium',
        completed: action.completed ?? false
      }).select('*').single()
      if (inserted.error) throw inserted.error
      result = inserted.data
    }

    if (action.action === 'toggle_task' && action.taskId) {
      const current = (tasksResult.data ?? []).find((task) => task.id === action.taskId)
      if (!current) throw new Error('Task not found')
      const updated = await supabase.from('tasks').update({ completed: !(current as { completed: boolean }).completed }).eq('id', action.taskId).select('*').single()
      if (updated.error) throw updated.error
      result = updated.data
    }

    if (action.action === 'update_event' && action.eventId) {
      const patch: Record<string, unknown> = {}
      if (action.title !== null) patch.title = action.title
      if (action.description !== null) patch.description = action.description
      if (action.startAt !== null) patch.start_at = action.startAt
      if (action.endAt !== null) patch.end_at = action.endAt
      if (action.location !== null) patch.location = action.location
      if (action.recurrenceRule !== null) patch.recurrence_rule = action.recurrenceRule
      const updated = await supabase.from('events').update(patch).eq('id', action.eventId).select('*').single()
      if (updated.error) throw updated.error
      result = updated.data
    }

    if (action.action === 'update_task' && action.taskId) {
      const patch: Record<string, unknown> = {}
      if (action.title !== null) patch.title = action.title
      if (action.description !== null) patch.description = action.description
      if (action.startAt !== null) patch.due_at = action.startAt
      if (action.priority !== null) patch.priority = action.priority
      if (action.completed !== null) patch.completed = action.completed
      const updated = await supabase.from('tasks').update(patch).eq('id', action.taskId).select('*').single()
      if (updated.error) throw updated.error
      result = updated.data
    }

    if (action.action === 'list_agenda') {
      response = response + '\n\n' + (eventsResult.data?.length ? eventsResult.data.slice(0, 12).map((event) => `• ${event.title} · ${new Date(event.start_at).toLocaleString('es-CO')}`).join('\n') : 'No tienes eventos próximos.')
    }

    if (action.action === 'list_tasks') {
      response = response + '\n\n' + (tasksResult.data?.filter((task) => !task.completed).slice(0, 12).map((task) => `• ${task.title} · ${task.priority}`).join('\n') || 'No tienes tareas pendientes.')
    }

    await supabase.from('ai_messages').insert([{ user_id: user.id, role: 'assistant', content: response }])

    res.json({ response, action, result })
  } catch (error) { respondError(error, res) }
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Calendar backend running on http://localhost:${port}`)
})
