import React from 'react'
import { useTaskContext } from '../../context/TaskContext'
import type { ViewMode } from '../../types'
import {
  LayoutGrid,
  Kanban,
  Table as TableIcon,
  Calendar,
  Clock,
  MessageSquare,
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
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6 select-none">
      {/* Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F1C] border border-slate-800/80 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.id === 'table' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {projectTasks.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick Add Button */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={() => openCreateTaskModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 bg-indigo-900/50 rounded border border-indigo-500/20">
            C
          </kbd>
        </button>
      </div>
    </div>
  )
}
