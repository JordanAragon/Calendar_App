import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Calendario' },
  { to: '/tasks', label: 'Tareas' },
  { to: '/settings', label: 'Ajustes' }
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-border h-screen sticky top-0 px-4 py-6">
      <span className="font-display font-semibold text-lg mb-8 px-2">Calendar</span>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `px-2 py-1.5 rounded-md text-sm transition-colors ${
                isActive ? 'bg-surface text-ink font-medium' : 'text-muted hover:bg-hover'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
