import React, { useState } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import { Avatar } from '../common/Avatar'
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  X,
  Clock,
} from 'lucide-react'

export const TopNavbar: React.FC = () => {
  const {
    activeProject,
    projects,
    setActiveProjectId,
    currentUser,
    isSidebarCollapsed,
    setIsCommandPaletteOpen,
    filters,
    setFilters,
    resetFilters,
    users,
    activities,
  } = useTaskContext()

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.assigneeId !== 'all' ||
    filters.search !== ''

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-[#090D17]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Left: Project selector breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeProject.color }}
            />
            <span className="text-sm font-semibold text-slate-100 max-w-[180px] sm:max-w-[260px] truncate">
              {activeProject.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">
              {activeProject.code}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Project dropdown menu */}
          {isProjectDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-[#0E1424] border border-slate-700/70 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn"
              onMouseLeave={() => setIsProjectDropdownOpen(false)}
            >
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Switch Project
              </div>
              <div className="py-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id)
                      setIsProjectDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      proj.id === activeProject.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{proj.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search anything in Taske...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Filter popover button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasActiveFilters
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          {/* Filter Popover panel */}
          {isFilterDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-[#0E1424] border border-slate-700/70 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn"
              onMouseLeave={() => setIsFilterDropdownOpen(false)}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Filters & Sorters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                {/* Search Text */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Keywords</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    placeholder="Search by title, tag..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Assignee</label>
                  <select
                    value={filters.assigneeId}
                    onChange={(e) => setFilters({ assigneeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Team Members</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0A0E1A]" />
          </button>

          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-[#0E1424] border border-slate-700/70 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn"
              onMouseLeave={() => setIsNotificationsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Activity Feed
                </span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Live
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="p-2 rounded-lg bg-slate-900/60 text-xs">
                    <p className="text-slate-300">
                      <span className="font-medium text-indigo-300">
                        {users.find((u) => u.id === act.userId)?.name || 'Someone'}
                      </span>{' '}
                      {act.action} <span className="text-slate-100 font-semibold">{act.targetTitle}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <Avatar user={currentUser} size="sm" showStatus={true} />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
