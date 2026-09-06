import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const ai = new GoogleGenAI({ apiKey })

const actionSchema = z.object({
  action: z.enum(['none', 'create_event', 'update_event', 'delete_event', 'create_task', 'update_task', 'delete_task', 'toggle_task', 'list_agenda', 'list_tasks']),
  response: z.string().min(1),
  eventId: z.string().nullable(),
  taskId: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  location: z.string().nullable(),
  recurrenceRule: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
  completed: z.boolean().nullable(),
  requiresConfirmation: z.boolean()
})

const jsonSchema = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['none','create_event','update_event','delete_event','create_task','update_task','delete_task','toggle_task','list_agenda','list_tasks'] },
    response: { type: 'string' },
    eventId: { type: ['string','null'] },
    taskId: { type: ['string','null'] },
    title: { type: ['string','null'] },
    description: { type: ['string','null'] },
    startAt: { type: ['string','null'] },
    endAt: { type: ['string','null'] },
    location: { type: ['string','null'] },
    recurrenceRule: { type: ['string','null'] },
    priority: { type: ['string','null'], enum: ['low','medium','high', null] },
    completed: { type: ['boolean','null'] },
    requiresConfirmation: { type: 'boolean' }
  },
  required: ['action','response','eventId','taskId','title','description','startAt','endAt','location','recurrenceRule','priority','completed','requiresConfirmation']
}

export async function interpretCommand(input: string, context: { now: string; timezone: string; events: unknown[]; tasks: unknown[] }) {
  const prompt = `
You are the command interpreter for a personal calendar app.
Return ONLY JSON matching the supplied schema.
Current datetime: ${context.now}
User timezone: ${context.timezone}
Existing events: ${JSON.stringify(context.events)}
Existing tasks: ${JSON.stringify(context.tasks)}

Rules:
- Understand Spanish and English.
- Convert relative dates such as hoy, mañana, next Monday using Current datetime and timezone.
- For create_event, title/startAt/endAt are required. If only a start time is provided, default duration to 60 minutes.
- For list_agenda and list_tasks, do not invent records. The server will append data.
- For delete_event and delete_task, always set requiresConfirmation=true and never claim it was deleted.
- For other mutations, set requiresConfirmation=false.
- If the request is ambiguous and a safe action cannot be inferred, use action=none and ask a concise clarification.
- eventId/taskId must be a real existing id when updating/deleting/toggling.
- Use ISO 8601 timestamps with timezone offsets when creating/updating events or due dates.
- Keep response concise and natural.

User request: ${input}
`

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: jsonSchema,
      temperature: 0.2
    }
  })

  return actionSchema.parse(JSON.parse(result.text ?? '{}'))
}
