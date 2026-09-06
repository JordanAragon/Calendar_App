import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import CalendarPage from '@/pages/calendar/CalendarPage'
import TasksPage from '@/pages/tasks/TasksPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import LoginPage from '@/pages/auth/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <CalendarPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])
