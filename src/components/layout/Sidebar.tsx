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
  Zap,
  FolderPlus,
  Sparkles,
  X,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    activeView,
    setActiveView,
    users,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
    openCreateTaskModal,
    setIsCreateProjectModalOpen,
    setIsTeamModalOpen,
    tasks,
    filters,
    setFilters,
  } = useTaskContext()

  const [isProjectsOpen, setIsProjectsOpen] = useState(true)

  const navItems: { id: ViewMode; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Bento Overview', shortcut: '1', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban Board', shortcut: '2', icon: Kanban },
    { id: 'table', label: 'Dense Table', shortcut: '3', icon: TableIcon },
    { id: 'calendar', label: 'Sprint Calendar', shortcut: '4', icon: Calendar },
    { id: 'timeline', label: 'Timeline & Gantt', shortcut: '5', icon: Clock },
    { id: 'team_chat', label: 'Team Messenger', shortcut: '6', icon: MessageSquare },
    { id: 'routines', label: 'Routines & Insights', shortcut: '7', icon: Sparkles },
  ]

  const isExpanded = isMobileSidebarOpen || !isSidebarCollapsed

  const handleSelectView = (viewId: ViewMode) => {
    setActiveView(viewId)
    setIsMobileSidebarOpen(false)
  }

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId)
    setIsMobileSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          data-testid="sidebar-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#09090D] border-r border-white/[0.08] transition-all duration-300 select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${
          isMobileSidebarOpen
            ? 'translate-x-0 w-72 shadow-2xl shadow-purple-950/60'
            : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08] bg-[#07070A]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-fuchsia-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#09090D] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              </div>
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">Taske</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate">Next-Gen Workspace</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              title="Close Menu"
              aria-label="Close Menu"
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse/expand button */}
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:block p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Views Navigation */}
        <div className="flex-1 overflow-y-auto momentum-scroll px-3 py-4 space-y-6">
          <div>
            {isExpanded && (
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
                    onClick={() => handleSelectView(item.id)}
                    title={!isExpanded ? `${item.label} (${item.shortcut})` : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/25 via-violet-600/15 to-transparent text-purple-200 border-l-2 border-purple-500 shadow-sm shadow-purple-950/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                    </div>
                    {isExpanded && (
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
            {isExpanded && (
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Projects ({projects.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsCreateProjectModalOpen(true)
                      setIsMobileSidebarOpen(false)
                    }}
                    title="Create New Project"
                    className="p-1 text-slate-400 hover:text-purple-300 hover:bg-purple-600/20 rounded transition-colors"
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

            {(isExpanded && isProjectsOpen) && (
              <div className="space-y-1">
                {projects.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">No projects yet</p>
                    <button
                      onClick={() => {
                        setIsCreateProjectModalOpen(true)
                        setIsMobileSidebarOpen(false)
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Create Project</span>
                    </button>
                  </div>
                ) : (
                  projects.map((proj) => {
                    const isActive = proj.id === activeProjectId
                    const projectTaskCount = tasks.filter((t) => t.projectId === proj.id).length

                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectProject(proj.id)}
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
                  })
                )}
              </div>
            )}
          </div>

          {/* Team Section */}
          {isExpanded && (
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Active Team ({users.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsTeamModalOpen(true)
                      setIsMobileSidebarOpen(false)
                    }}
                    title="Invite & Manage Team"
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Invite</span>
                  </button>
                  {filters.assigneeId !== 'all' && (
                    <button
                      onClick={() => setFilters({ assigneeId: 'all' })}
                      className="text-[10px] text-slate-400 hover:text-slate-200 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1 px-1">
                {users.map((u) => {
                  const isFiltered = filters.assigneeId === u.id
                  const isInProject = Boolean(activeProject?.id && activeProject.memberIds?.includes(u.id))
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setFilters({ assigneeId: isFiltered ? 'all' : u.id })
                        setIsMobileSidebarOpen(false)
                      }}
                      title={`Click to filter tasks by ${u.name}${isInProject ? ' (Project Member)' : ''}`}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                        isFiltered
                          ? 'bg-purple-600/20 text-purple-200 font-semibold border border-purple-500/30'
                          : 'text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <Avatar user={u} size="sm" showStatus={true} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-slate-200 truncate">{u.name}</p>
                          {isInProject && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Assigned to current project" />
                          )}
                        </div>
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
        <div className="p-3 border-t border-white/[0.08] bg-[#07070A] space-y-2">
          <button
            onClick={() => {
              openCreateTaskModal()
              setIsMobileSidebarOpen(false)
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 transition-all ${
              !isExpanded ? 'p-2' : ''
            }`}
            title="Create New Task (Press 'C')"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isExpanded && <span>New Task</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
export default Sidebar
