import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { RoutinesView } from './components/views/RoutinesView'
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer'
import { CreateTaskModal } from './components/tasks/CreateTaskModal'
import { CreateProjectModal } from './components/tasks/CreateProjectModal'
import { CommandPalette } from './components/common/CommandPalette'
import { AuthModal } from './components/modals/AuthModal'
import { TeamInviteModal } from './components/modals/TeamInviteModal'

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
      case 'routines':
        return <RoutinesView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 flex flex-col font-sans relative selection:bg-purple-500/30 selection:text-purple-200">
      {/* Ambient background violet gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[950px] h-[450px] bg-gradient-to-b from-purple-600/15 via-violet-600/10 to-transparent blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-fuchsia-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -left-40 w-[500px] h-[500px] bg-violet-600/5 blur-[140px] rounded-full" />
      </div>

      <Sidebar />
      <TopNavbar />

      <main
        className={`flex-1 pt-20 px-3 sm:px-6 pb-12 transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-16 sm:ml-64'
        }`}
      >
        <div className="max-w-[1600px] mx-auto">
          <ViewNavigationTabs />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Overlays & Drawers */}
      <TaskDetailDrawer />
      <CreateTaskModal />
      <CreateProjectModal />
      <CommandPalette />
      <AuthModal />
      <TeamInviteModal />
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
