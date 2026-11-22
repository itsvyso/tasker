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
  FolderPlus,
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
    openCreateTaskModal,
    setIsCreateProjectModalOpen,
    tasks,
    filters,
    setFilters,
    resetToMockData,
  } = useTaskContext()

  const [isProjectsOpen, setIsProjectsOpen] = useState(true)

  const navItems: { id: ViewMode; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Bento Overview', shortcut: '1', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban Board', shortcut: '2', icon: Kanban },
    { id: 'table', label: 'Dense Table', shortcut: '3', icon: TableIcon },
    { id: 'calendar', label: 'Sprint Calendar', shortcut: '4', icon: Calendar },
    { id: 'timeline', label: 'Timeline & Gantt', shortcut: '5', icon: Clock },
    { id: 'team_chat', label: 'Team Messenger', shortcut: '6', icon: MessageSquare },
  ]

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[#0A0E1A] border-r border-slate-800/80 transition-all duration-300 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-16 sm:w-64'
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
            <div className="hidden sm:flex flex-col min-w-0">
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
          className="hidden sm:block p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Views Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isSidebarCollapsed && (
            <div className="hidden sm:block px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                  title={isSidebarCollapsed ? `${item.label} (${item.shortcut})` : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/25 to-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="hidden sm:inline truncate">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <kbd className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          {!isSidebarCollapsed && (
            <div className="hidden sm:flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Projects ({projects.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  title="Create New Project"
                  className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/20 rounded transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className="p-1 text-slate-400 hover:text-slate-300"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isProjectsOpen ? '' : '-rotate-90'}`} />
                </button>
              </div>
            </div>
          )}

          {(!isSidebarCollapsed && isProjectsOpen) && (
            <div className="hidden sm:block space-y-1">
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
          <div className="hidden sm:block">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Team ({users.length})
              </span>
              {filters.assigneeId !== 'all' && (
                <button
                  onClick={() => setFilters({ assigneeId: 'all' })}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="space-y-1 px-1">
              {users.map((u) => {
                const isFiltered = filters.assigneeId === u.id
                return (
                  <button
                    key={u.id}
                    onClick={() =>
                      setFilters({ assigneeId: isFiltered ? 'all' : u.id })
                    }
                    title={`Click to filter tasks by ${u.name}`}
                    className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg text-xs text-left transition-colors ${
                      isFiltered
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <Avatar user={u} size="sm" showStatus={true} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-200 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-[#080B14] space-y-2">
        <button
          onClick={() => openCreateTaskModal()}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all ${
            isSidebarCollapsed ? 'p-2' : ''
          }`}
          title="Create New Task (Press 'C')"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isSidebarCollapsed && <span className="hidden sm:inline">New Task</span>}
        </button>

        {!isSidebarCollapsed && (
          <button
            onClick={resetToMockData}
            title="Reset to showcase demo data"
            className="hidden sm:flex w-full items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </button>
        )}
      </div>
    </aside>
  )
}
