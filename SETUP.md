# Puesta en marcha

## 1. Supabase

Crea un proyecto en Supabase, abre SQL Editor y ejecuta `supabase/001_initial.sql`.

En Authentication > Providers > Google habilita Google y configura las credenciales OAuth del proyecto. Añade la URL local del frontend (`http://localhost:5173`) y la URL de producción correspondiente en las URLs de redirección de Supabase.

## 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Completa:

```env
VITE_API_URL=http://localhost:8787
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

## 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Completa:

```env
PORT=8787
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
GEMINI_API_KEY=TU_CLAVE_DE_GEMINI
GEMINI_MODEL=gemini-2.5-flash
```

Nunca pongas `GEMINI_API_KEY` en el frontend ni en una variable `VITE_*`.

## 4. Producción

Frontend: Vercel/Netlify.
Backend: Railway/Render/Fly.io.
Database/Auth: Supabase.

Configura `CLIENT_ORIGIN` con el dominio real del frontend y registra ese dominio en Supabase Auth.
