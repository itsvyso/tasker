import React, { useState, useMemo } from 'react'
import { useTaskContext } from '../../context/TaskContext'
import { Avatar } from '../common/Avatar'
import { DynamicIsland } from './DynamicIsland'
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  X,
  Clock,
  FolderPlus,
  Cloud,
  Users as UsersIcon,
  Menu,
  LogOut,
} from 'lucide-react'

export const TopNavbar: React.FC = () => {
  const {
    activeProject,
    activeProjectMembers,
    projects,
    setActiveProjectId,
    currentUser,
    isSidebarCollapsed,
    toggleMobileSidebar,
    setIsCommandPaletteOpen,
    setIsCreateProjectModalOpen,
    setSelectedTaskId,
    filters,
    setFilters,
    resetFilters,
    users,
    tasks,
    activities,
    syncStatus,
    isCloudEnabled,
    authUser,
    setIsAuthModalOpen,
    setIsTeamModalOpen,
    signOut,
  } = useTaskContext()

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [tasks])

  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.assigneeId !== 'all' ||
    filters.tag !== 'all' ||
    filters.search !== ''

  return (
    <header
      className={`fixed top-0 right-0 z-20 bg-[#08080B]/85 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-6 transition-all duration-300 pt-[env(safe-area-inset-top,0px)] h-[calc(4rem+env(safe-area-inset-top,0px))] left-0 ${
        isSidebarCollapsed ? 'md:left-16' : 'md:left-64'
      }`}
    >
      {/* Left: Mobile menu toggle & Project selector */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={toggleMobileSidebar}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
          className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
        >
          <Menu className="w-5 h-5 text-purple-400" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left min-h-[44px]"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeProject.color }}
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-100 max-w-[90px] xs:max-w-[130px] sm:max-w-[240px] truncate">
              {activeProject.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50 hidden xs:inline">
              {activeProject.code}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Project dropdown menu */}
          {isProjectDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-[#0E0E14] border border-white/[0.1] shadow-2xl shadow-black/80 border border-slate-700/70 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn"
              onMouseLeave={() => setIsProjectDropdownOpen(false)}
            >
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Switch Project</span>
                <span className="text-[10px] font-mono text-slate-400">{projects.length} total</span>
              </div>
              <div className="py-1 max-h-56 overflow-y-auto">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id)
                      setIsProjectDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      proj.id === activeProject.id
                        ? 'bg-purple-600/20 text-purple-300 font-semibold'
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
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false)
                    setIsCreateProjectModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-300 hover:bg-purple-600/15 rounded-lg transition-colors font-medium"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
          )}
          {/* Project Members Avatars & Add Member Quick Action */}
          {activeProject?.id && (
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
              <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                {activeProjectMembers.slice(0, 3).map((m) => (
                  <div key={m.id} title={`${m.name} (${m.role})`}>
                    <Avatar user={m} size="xs" showStatus={false} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                title="Add or manage members for this project"
                className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs border border-purple-500/30 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UsersIcon className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-semibold">
                  {activeProjectMembers.length > 0 ? `${activeProjectMembers.length} members` : '+ Add'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Dynamic Island & Quick Search */}
      <div className="flex items-center justify-center flex-1 mx-2 sm:mx-6 min-w-0">
        <DynamicIsland />
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          title="Search Tasks (⌘K)"
          className="hidden xl:flex items-center gap-2 ml-3 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-white/10 text-xs text-slate-400 transition-all shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">Search...</span>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800/80 text-slate-400 rounded border border-slate-700/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Filter popover button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border transition-colors min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 ${
              hasActiveFilters
                ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950/50'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
            title="Filter Tasks"
            aria-label="Filter Tasks"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            )}
          </button>

          {/* Filter Popover panel */}
          {isFilterDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-[#0E0E14] border border-white/[0.1] shadow-2xl shadow-black/80 rounded-xl p-4 z-50 animate-fadeIn"
              onMouseLeave={() => setIsFilterDropdownOpen(false)}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Filters & Sorters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
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
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
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
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
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
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Team Members</option>
                    {users.map((u) => {
                      const isInProject = Boolean(activeProject?.id && activeProject.memberIds?.includes(u.id))
                      return (
                        <option key={u.id} value={u.id}>
                          {u.name} {isInProject ? '• (Project Member)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Tag */}
                {allTags.length > 0 && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tag / Label</label>
                    <select
                      value={filters.tag}
                      onChange={(e) => setFilters({ tag: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Tags</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cloud Sync & Auth Button */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          title="Cloud Sync & Auth Settings"
          aria-label="Cloud Sync & Auth Settings"
          data-testid="navbar-cloud-btn"
          className="flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors text-xs min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0"
        >
          <Cloud className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline font-medium">
            {authUser ? authUser.email?.split('@')[0] : syncStatus === 'synced' ? 'Cloud Synced' : isCloudEnabled ? 'Cloud' : 'Offline'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-400'
                : syncStatus === 'syncing'
                ? 'bg-amber-400 animate-pulse'
                : isCloudEnabled
                ? 'bg-indigo-400'
                : 'bg-slate-400'
            }`}
          />
        </button>

        {/* Team Collaboration Button */}
        <button
          onClick={() => setIsTeamModalOpen(true)}
          title="Manage Team Members"
          aria-label="Manage Team Members"
          data-testid="navbar-team-btn"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors text-xs min-h-[40px]"
        >
          <UsersIcon className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline font-medium">Team</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Activity Feed & Notifications"
            aria-label="Activity Feed & Notifications"
            className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0A0E1A]" />
          </button>

          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-[#0E0E14] border border-white/[0.1] shadow-2xl shadow-black/80 rounded-xl p-3 z-50 animate-fadeIn"
              onMouseLeave={() => setIsNotificationsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Activity Feed
                </span>
                <span className="text-[10px] text-purple-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Live
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activities.slice(0, 8).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (act.taskId) {
                        setSelectedTaskId(act.taskId)
                        setIsNotificationsOpen(false)
                      }
                    }}
                    className={`p-2 rounded-lg bg-slate-900/60 text-xs transition-colors ${
                      act.taskId ? 'hover:bg-slate-800/80 cursor-pointer' : ''
                    }`}
                  >
                    <p className="text-slate-300">
                      <span className="font-medium text-purple-300">
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

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            title="User Profile & Account Menu"
            data-testid="navbar-profile-btn"
            className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity min-h-[40px] cursor-pointer"
          >
            <Avatar user={currentUser} size="sm" showStatus={true} />
            <div className="hidden lg:flex flex-col text-left max-w-[120px]">
              <span className="text-xs font-semibold text-slate-200 leading-tight truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight truncate">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div
              data-testid="navbar-profile-dropdown"
              className="absolute right-0 mt-2 w-72 bg-[#0E0E14] border border-white/[0.12] shadow-2xl shadow-black/80 rounded-2xl p-3 z-50 animate-fadeIn"
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              {/* User details header */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06] mb-2 flex items-center gap-3">
                <Avatar user={currentUser} size="md" showStatus={true} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-purple-300 font-medium mt-0.5">{currentUser.role}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between border-b border-white/[0.06] mb-1">
                <span>Cloud Status</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  Connected
                </span>
              </div>

              {/* Menu Actions */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false)
                    setIsTeamModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <UsersIcon className="w-4 h-4 text-purple-400" />
                  <span>Team Members & Roles</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false)
                    setIsAuthModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <span>Cloud & Sync Diagnostics</span>
                </button>

                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <button
                    data-testid="navbar-sign-out-btn"
                    onClick={async () => {
                      setIsProfileDropdownOpen(false)
                      await signOut()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
