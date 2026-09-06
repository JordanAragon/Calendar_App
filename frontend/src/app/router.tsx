import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppShell } from './AppShell'
import CalendarPage from '@/pages/calendar/CalendarPage'
import TasksPage from '@/pages/tasks/TasksPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import LoginPage from '@/pages/auth/LoginPage'
import { useAuth } from '@/context/AuthContext'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-muted">Cargando…</div>
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-muted">Cargando…</div>
  return user ? <Navigate to="/" replace /> : children
}

export const router = createBrowserRouter([
  { path: '/login', element: <GuestRoute><LoginPage /></GuestRoute> },
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: <CalendarPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])
