import React from 'react'
import { TaskProvider, useTaskContext } from './context/TaskContext'
import { Sidebar } from './components/layout/Sidebar'
import { TopNavbar } from './components/layout/TopNavbar'
import { ViewNavigationTabs } from './components/common/ViewNavigationTabs'
import { DashboardView } from './components/views/DashboardView'
import { KanbanView } from './components/views/KanbanView'
import { TableView } from './components/views/TableView'
import { CalendarView } from './components/views/CalendarView'
import { TimelineView } from './components/views/TimelineView'
import { TeamChatView } from './components/views/TeamChatView'
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer'
import { CreateTaskModal } from './components/tasks/CreateTaskModal'
import { CreateProjectModal } from './components/tasks/CreateProjectModal'
import { CommandPalette } from './components/common/CommandPalette'

const MainContent: React.FC = () => {
  const { activeView, isSidebarCollapsed } = useTaskContext()

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'kanban':
        return <KanbanView />
      case 'table':
        return <TableView />
      case 'calendar':
        return <CalendarView />
      case 'timeline':
        return <TimelineView />
      case 'team_chat':
        return <TeamChatView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-[#090D17] text-slate-100 flex flex-col font-sans">
      <Sidebar />
      <TopNavbar />

      <main
        className={`flex-1 pt-20 px-3 sm:px-6 pb-12 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-16 sm:ml-64'
        }`}
      >
        <div className="max-w-[1600px] mx-auto">
          <ViewNavigationTabs />
          {renderActiveView()}
        </div>
      </main>

      {/* Overlays & Drawers */}
      <TaskDetailDrawer />
      <CreateTaskModal />
      <CreateProjectModal />
      <CommandPalette />
    </div>
  )
}

export function App() {
  return (
    <TaskProvider>
      <MainContent />
    </TaskProvider>
  )
}

export default App
