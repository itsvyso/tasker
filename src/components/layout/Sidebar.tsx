import React, { useState } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import type { ViewMode } from '../../types'
import { Avatar } from '../common/Avatar'
import {
  LayoutGrid,
  Kanban,
  Table as TableIcon,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  Zap,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeView,
    setActiveView,
    users,
    isSidebarCollapsed,
    toggleSidebar,
    setIsCreateTaskModalOpen,
    tasks,
    resetToMockData,
  } = useTaskContext()

  const [isProjectsOpen, setIsProjectsOpen] = useState(true)

  const navItems: { id: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Bento Overview', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'table', label: 'Dense Table', icon: TableIcon },
    { id: 'calendar', label: 'Sprint Calendar', icon: Calendar },
    { id: 'timeline', label: 'Timeline & Gantt', icon: Clock },
    { id: 'team_chat', label: 'Team Messenger', icon: MessageSquare },
  ]

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[#0A0E1A] border-r border-slate-800/80 transition-all duration-300 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 bg-[#080B14]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#090D17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">Taske</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate">Next-Gen Workspace</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Views Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Views
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/25 to-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Projects ({projects.length})
              </span>
              <button
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="text-slate-400 hover:text-slate-300"
              >
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isProjectsOpen ? '' : '-rotate-90'}`} />
              </button>
            </div>
          )}

          {(!isSidebarCollapsed && isProjectsOpen) && (
            <div className="space-y-1">
              {projects.map((proj) => {
                const isActive = proj.id === activeProjectId
                const projectTaskCount = tasks.filter((t) => t.projectId === proj.id).length

                return (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProjectId(proj.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/50">
                      {projectTaskCount}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Team Section */}
        {!isSidebarCollapsed && (
          <div>
            <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Team ({users.length})
            </div>
            <div className="space-y-2 px-1">
              {users.slice(0, 4).map((u) => (
                <div key={u.id} className="flex items-center gap-2.5 py-1 text-xs text-slate-300">
                  <Avatar user={u} size="sm" showStatus={true} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-[#080B14] space-y-2">
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all ${
            isSidebarCollapsed ? 'p-2' : ''
          }`}
          title="Create New Task (Press 'C')"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isSidebarCollapsed && <span>New Task</span>}
        </button>

        {!isSidebarCollapsed && (
          <button
            onClick={resetToMockData}
            title="Reset to showcase demo data"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </button>
        )}
      </div>
    </aside>
  )
}
