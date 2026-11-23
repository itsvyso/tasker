import React from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { ViewMode } from '../../types'
import { snappySpring } from '../../utils/motion'
import {
  LayoutGrid,
  Kanban,
  Table as TableIcon,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  Plus,
} from 'lucide-react'

export const ViewNavigationTabs: React.FC = () => {
  const { activeView, setActiveView, projectTasks, openCreateTaskModal } = useTaskContext()

  const tabs: { id: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Bento Overview', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'table', label: 'Dense Table', icon: TableIcon },
    { id: 'calendar', label: 'Sprint Calendar', icon: Calendar },
    { id: 'timeline', label: 'Timeline & Gantt', icon: Clock },
    { id: 'team_chat', label: 'Team Messenger', icon: MessageSquare },
    { id: 'routines', label: 'Routines & Insights', icon: Sparkles },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6 select-none">
      {/* Navigation Pills */}
      <LayoutGroup id="viewNavTabs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E0E14] border border-white/[0.08] overflow-x-auto momentum-scroll no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeViewTab"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 shadow-lg shadow-purple-600/30 border border-purple-400/25 -z-10"
                    transition={snappySpring}
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === 'table' && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                      isActive
                        ? 'bg-purple-900/60 text-purple-200 border border-purple-400/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {projectTasks.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </LayoutGroup>

      {/* Quick Add Button */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={snappySpring}
          onClick={() => openCreateTaskModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-violet-600/20 hover:from-purple-600/30 hover:to-violet-600/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 bg-purple-950/60 text-purple-300 rounded border border-purple-500/30">
            C
          </kbd>
        </motion.button>
      </div>
    </div>
  )
}
