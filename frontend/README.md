# Calendar — Frontend

React + TypeScript + Vite + Tailwind + PWA.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Estado actual

- Vista de calendario (agenda diaria) con datos de ejemplo en `src/services/mock-data.ts`
- Vista de tareas
- Panel del asistente de IA (UI únicamente — el envío todavía no llama al backend, ver el `TODO` en `AiAssistantPanel.tsx`)
- Pantalla de login (botón de Google sin lógica OAuth conectada aún)

## Pendiente (cuando exista el backend)

- Reemplazar `mock-data.ts` por llamadas reales en `src/services/`
- Conectar `AiAssistantPanel` a `POST /ai/messages`
- Conectar `LoginPage` al flujo OAuth de Google
- Suscripción a push notifications (`src/services/notifications.service.ts` + `public/sw.js`)
