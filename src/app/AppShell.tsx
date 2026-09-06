import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { AiAssistantPanel } from '@/components/ai-assistant/AiAssistantPanel'

export function AppShell() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-6 py-8 md:px-10">
        <Outlet />
      </main>
      <AiAssistantPanel />
    </div>
  )
}
