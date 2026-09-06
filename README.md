# Calendar

Calendario personal con React, PostgreSQL/Supabase y asistente de lenguaje natural con Gemini.

## Estructura

- `frontend/`: React + TypeScript + Vite + Tailwind + PWA.
- `backend/`: Node.js + Express + TypeScript + Supabase + Gemini.
- `supabase/001_initial.sql`: tablas, índices, RLS y trigger de perfil/calendario inicial.

## Requisitos

- Node.js 22+
- Un proyecto de Supabase
- Google provider habilitado en Supabase Auth
- Una Gemini API key

## Configuración

1. Ejecuta `supabase/001_initial.sql` en el SQL Editor de Supabase.
2. Copia `frontend/.env.example` como `frontend/.env` y configura URL/anon key de Supabase y la URL del backend.
3. Copia `backend/.env.example` como `backend/.env` y configura `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.
4. En Supabase Auth > Providers > Google, configura OAuth y agrega `http://localhost:5173` como URL de redirección autorizada.
5. Instala dependencias con `npm run install:all`.
6. Ejecuta `npm run dev`.

## IA

El backend usa `gemini-2.5-flash` por defecto. La clave nunca llega al navegador. Gemini produce una salida estructurada que el backend valida antes de ejecutar operaciones del calendario.

Acciones soportadas: crear, actualizar, eliminar y consultar eventos/tareas. Las eliminaciones requieren confirmación en la interfaz.

## Variables

Frontend:

```env
VITE_API_URL=http://localhost:8787
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Backend:

```env
PORT=8787
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```
