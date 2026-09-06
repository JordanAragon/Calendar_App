import { Outlet, NavLink } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { AiAssistantPanel } from '@/components/ai-assistant/AiAssistantPanel'
import { useAuth } from '@/context/AuthContext'

export function AppShell() {
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="md:hidden sticky top-0 z-20 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-display font-semibold">Calendar</span>
          <button onClick={signOut} className="text-xs text-muted hover:text-ink">Salir</button>
        </div>
        <div className="px-4 py-6 sm:px-6 md:px-10">
          <Outlet />
        </div>
      </main>
      <AiAssistantPanel />
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-30 bg-bg border-t border-border grid grid-cols-3">
        <NavLink end to="/" className={({ isActive }) => `py-3 text-center text-xs ${isActive ? 'font-medium text-ink' : 'text-muted'}`}>Calendario</NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `py-3 text-center text-xs ${isActive ? 'font-medium text-ink' : 'text-muted'}`}>Tareas</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `py-3 text-center text-xs ${isActive ? 'font-medium text-ink' : 'text-muted'}`}>Ajustes</NavLink>
      </nav>
    </div>
  )
}
