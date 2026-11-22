import React from 'react'
import { useTaskContext } from '../../context/TaskContext'
import { PriorityBadge } from '../common/Badge'
import { Avatar } from '../common/Avatar'
import { formatDate, isOverdue } from '../../utils/formatters'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
  ArrowUpRight,
  Plus,
  Users,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react'

export const DashboardView: React.FC = () => {
  const {
    activeProject,
    projectTasks,
    users,
    activities,
    setSelectedTaskId,
    openCreateTaskModal,
    setActiveView,
    moveTaskStatus,
    setFilters,
  } = useTaskContext()

  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress').length
  const inReviewTasks = projectTasks.filter((t) => t.status === 'in_review').length
  const backlogTasks = projectTasks.filter((t) => t.status === 'backlog').length
  const urgentTasks = projectTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done')

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalEstimatedHours = projectTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
  const totalLoggedHours = projectTasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0)

  // Upcoming deadlines (tasks not done, sorted by due date)
  const upcomingTasks = [...projectTasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)

  return (
    <div className="space-y-6 animate-fadeIn pb-12 select-none">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0E1528] to-cyan-950/40 border border-slate-800/80 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Active Sprint • Week 47
              </span>
              <span className="text-xs text-slate-400">Target: {activeProject.targetDate}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activeProject.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('kanban')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Open Kanban
            </button>
            <button
              onClick={() => openCreateTaskModal()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              New Sprint Task
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Sprint Progress */}
        <div className="p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Sprint Completion</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {completionPercentage}%
              </span>
              <span className="text-xs text-slate-400 ml-2">
                ({completedTasks}/{totalTasks} tasks)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          {/* Visual progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric Card 2: In-Progress / Velocity */}
        <div className="p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {inProgressTasks + inReviewTasks}
              </span>
              <span className="text-xs text-slate-400 ml-2">in flight</span>
            </div>
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {inReviewTasks} in review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {backlogTasks} tasks queued in sprint backlog
          </p>
        </div>

        {/* Metric Card 3: Hours Logged vs Estimate */}
        <div className="p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Hours Burned</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {totalLoggedHours}h
              </span>
              <span className="text-xs text-slate-400 ml-2">/ {totalEstimatedHours}h est.</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {Math.round((totalLoggedHours / Math.max(1, totalEstimatedHours)) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
              style={{
                width: `${Math.min(
                  100,
                  (totalLoggedHours / Math.max(1, totalEstimatedHours)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Metric Card 4: Urgent Blockers */}
        <div
          onClick={() => {
            if (urgentTasks.length > 0) {
              setFilters({ priority: 'urgent' })
              setActiveView('table')
            }
          }}
          className={`p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all ${
            urgentTasks.length > 0 ? 'cursor-pointer hover:border-rose-500/40' : ''
          }`}
          title={urgentTasks.length > 0 ? 'Click to view urgent tasks in table' : undefined}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Urgent Issues</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {urgentTasks.length}
              </span>
              <span className="text-xs text-slate-400 ml-2">high priority</span>
            </div>
            {urgentTasks.length > 0 ? (
              <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                Needs attention
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                All clear
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 truncate">
            {urgentTasks.length > 0 ? urgentTasks[0].title : 'Zero blocking critical bugs'}
          </p>
        </div>
      </div>

      {/* Bento Middle Row: Upcoming Deadlines + Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Deadlines (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Upcoming Sprint Deadlines</h3>
            </div>
            <button
              onClick={() => setActiveView('table')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View all tasks <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {upcomingTasks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No active tasks with pending deadlines!
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId)
                const overdue = isOverdue(task.dueDate, task.status)
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {task.taskCode}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-200 truncate hover:text-white">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <PriorityBadge priority={task.priority} />
                          <span
                            className={`text-[10px] ${
                              overdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            Due {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <Avatar user={assignee} size="sm" showStatus={true} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveTaskStatus(task.id, 'done')
                        }}
                        title="Mark Done"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Team Workload Card (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Team Workload</h3>
              </div>
              <span className="text-[11px] text-slate-400">{users.length} members</span>
            </div>

            <div className="space-y-3.5">
              {users.map((member) => {
                const memberTasks = projectTasks.filter(
                  (t) => t.assigneeId === member.id && t.status !== 'done'
                )
                const memberHours = memberTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0)
                const loadPercent = Math.min(100, (memberHours / 40) * 100)

                return (
                  <div key={member.id} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar user={member} size="xs" showStatus={true} />
                        <span className="font-medium text-slate-200 truncate">{member.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {memberTasks.length} tasks • {memberHours}h
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          loadPercent > 80
                            ? 'bg-rose-500'
                            : loadPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Standard Sprint Capacity: 40h/wk</span>
            <span className="text-indigo-400 font-semibold">Optimal</span>
          </div>
        </div>
      </div>

      {/* Bento Bottom Row: Live Activity Stream + Project Quick Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Activity (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100">Live Team Activity</h3>
            </div>
            <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Real-time audit
            </span>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 5).map((act) => {
              const user = users.find((u) => u.id === act.userId)
              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (act.taskId) setSelectedTaskId(act.taskId)
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 text-xs border border-slate-800/60 transition-colors ${
                    act.taskId ? 'cursor-pointer hover:bg-slate-800/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={user} size="xs" />
                    <div className="min-w-0 truncate">
                      <span className="font-semibold text-slate-200">{user?.name || 'Someone'}</span>{' '}
                      <span className="text-slate-400">{act.action}</span>{' '}
                      <span className="font-medium text-indigo-300 truncate">{act.targetTitle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                    {act.timestamp}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Project Deliverable Stats (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-3">Project Metadata</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Category</span>
                <span className="text-slate-200 font-medium">{activeProject.category}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Project Code</span>
                <span className="font-mono text-indigo-300 font-semibold">{activeProject.code}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Sprint Budget</span>
                <span className="text-emerald-400 font-medium">{activeProject.budget || '$50,000'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Created Date</span>
                <span className="text-slate-200 font-medium">{activeProject.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between mt-4">
            <span>Designed for High Output</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
