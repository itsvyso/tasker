import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskProvider, useTaskContext } from './context/TaskContext'
import { Sidebar } from './components/layout/Sidebar'
import { TopNavbar } from './components/layout/TopNavbar'
import { MobileBottomNav } from './components/layout/MobileBottomNav'
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
import { LoginScreen } from './components/auth/LoginScreen'
import { Zap } from 'lucide-react'

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
        className={`flex-1 pt-[calc(4.75rem+env(safe-area-inset-top,0px))] px-3 sm:px-6 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-12 transition-all duration-300 relative z-10 ml-0 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
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

      {/* Mobile Floating Bottom Navigation Dock */}
      <MobileBottomNav />

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

const AppContent: React.FC = () => {
  const { authUser, isAuthLoading } = useTaskContext()

  if (isAuthLoading) {
    return (
      <div
        data-testid="app-auth-loading"
        className="min-h-screen bg-[#08080B] flex flex-col items-center justify-center text-slate-200 relative selection:bg-purple-500/30 selection:text-purple-200"
      >
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full" />
        </div>
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-fuchsia-500 p-0.5 shadow-2xl shadow-purple-600/50 flex items-center justify-center relative z-10"
        >
          <div className="w-full h-full bg-[#09090D] rounded-[14px] flex items-center justify-center">
            <Zap className="w-8 h-8 text-purple-400 fill-purple-400/20 animate-pulse" />
          </div>
        </motion.div>
        <div className="mt-5 text-xs font-mono tracking-widest text-purple-300 uppercase relative z-10">
          Initializing Secure Workspace...
        </div>
      </div>
    )
  }

  if (!authUser) {
    return <LoginScreen />
  }

  return <MainContent />
}

export function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}

export default App
