import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import type { Task } from '../../types'
import { Avatar } from '../common/Avatar'
import { snappySpring } from '../../utils/motion'
import { Clock, ChevronLeft, ChevronRight, FolderPlus } from 'lucide-react'

export const TimelineView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId, users, projects, setIsCreateProjectModalOpen } = useTaskContext()

  // Dynamic timeline anchor date
  const [startDate, setStartDate] = useState(() => new Date(2026, 10, 15))
  const [todayDateStr] = useState(() => new Date().toISOString().split('T')[0])

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 px-4 text-center max-w-md mx-auto select-none">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
          <FolderPlus className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
        <p className="text-xs text-slate-400 mb-6">
          Create your first project to view tasks on the Gantt timeline.
        </p>
        <button
          onClick={() => setIsCreateProjectModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create your first project</span>
        </button>
      </div>
    )
  }
  const totalDays = 21
  const msPerDay = 1000 * 60 * 60 * 24

  const endDate = new Date(startDate.getTime() + (totalDays - 1) * msPerDay)

  const prevWeek = () => {
    setStartDate((prev) => new Date(prev.getTime() - 7 * msPerDay))
  }

  const nextWeek = () => {
    setStartDate((prev) => new Date(prev.getTime() + 7 * msPerDay))
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Anchor timeline with today around the first third of the view
    setStartDate(new Date(today.getTime() - 4 * msPerDay))
  }

  const timelineDays: { date: Date; dateStr: string; dayNum: number; dayName: string }[] = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime() + i * msPerDay)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`
    timelineDays.push({
      date: d,
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
    })
  }

  const getPositionStyles = (task: Task) => {
    const startStr = task.startDate || task.dueDate
    const [sy, sm, sd] = startStr.split('-').map(Number)
    const [ey, em, ed] = task.dueDate.split('-').map(Number)

    const taskStart = new Date(sy, sm - 1, sd)
    const taskEnd = new Date(ey, em - 1, ed)

    const windowStart = new Date(startDate)
    windowStart.setHours(0, 0, 0, 0)
    const windowEnd = new Date(endDate)
    windowEnd.setHours(23, 59, 59, 999)

    // Check if task is outside the visible window
    if (taskEnd.getTime() < windowStart.getTime() || taskStart.getTime() > windowEnd.getTime()) {
      return { display: 'none' }
    }

    // Clip visible interval to current window
    const visibleStart = Math.max(taskStart.getTime(), windowStart.getTime())
    const visibleEnd = Math.min(taskEnd.getTime(), windowEnd.getTime())

    const startOffsetDays = Math.max(0, (visibleStart - windowStart.getTime()) / msPerDay)
    const durationDays = Math.max(1, (visibleEnd - visibleStart) / msPerDay + 1)

    const leftPercent = Math.min(96, (startOffsetDays / totalDays) * 100)
    const widthPercent = Math.min(100 - leftPercent, Math.max(4, (durationDays / totalDays) * 100))

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Sprint Timeline & Gantt</h2>
            <p className="text-[11px] text-slate-400">
              Horizon: {timelineDays[0]?.dateStr} to {timelineDays[timelineDays.length - 1]?.dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span>In Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Done</span>
            </div>
          </div>

          {/* Time Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors min-h-[40px]"
            >
              Today
            </button>
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden min-h-[40px]">
              <button
                onClick={prevWeek}
                title="Previous Week"
                aria-label="Previous Week"
                className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors min-w-[40px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-5 bg-slate-700" />
              <button
                onClick={nextWeek}
                title="Next Week"
                aria-label="Next Week"
                className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors min-w-[40px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1424] overflow-x-auto momentum-scroll shadow-xl">
        <div className="min-w-[900px]">
          {/* Timeline Days Header */}
          <div className="flex border-b border-slate-800 bg-[#0B0F1C] text-xs">
            <div className="w-64 p-3 font-semibold text-slate-400 shrink-0 border-r border-slate-800">
              Tasks
            </div>
            <div className="flex-1 flex">
              {timelineDays.map(({ dayNum, dayName, dateStr }, i) => {
                const isToday = dateStr === todayDateStr
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center py-2 px-1 border-r border-slate-800/60 ${
                      isToday ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">{dayName}</div>
                    <div className="text-xs font-semibold">{dayNum}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline Tasks Rows */}
          <div className="divide-y divide-slate-800/50">
            {filteredTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId)
              const completedSubtasks = task.subtasks.filter((s) => s.completed).length
              const totalSubtasks = task.subtasks.length
              const posStyles = getPositionStyles(task)

              const statusColor =
                task.status === 'done'
                  ? 'bg-emerald-600/80 border-emerald-500 shadow-emerald-950/50'
                  : task.status === 'in_review'
                  ? 'bg-purple-600/80 border-purple-500 shadow-purple-950/50'
                  : task.status === 'in_progress'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-500 shadow-purple-950/50'
                  : 'bg-slate-700/80 border-slate-600 shadow-slate-950/50'

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex items-center hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  {/* Task label col */}
                  <div className="w-64 p-3 shrink-0 border-r border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                          {task.taskCode}
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {task.title}
                        </span>
                      </div>
                    </div>
                    <Avatar user={assignee} size="xs" />
                  </div>

                  {/* Gantt Bar Lane */}
                  <div className="flex-1 relative h-12 flex items-center px-1">
                    {posStyles.display === 'none' ? (
                      <span className="text-[10px] text-slate-600 italic px-3">
                        Scheduled outside visible window ({task.startDate || task.dueDate} → {task.dueDate})
                      </span>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={snappySpring}
                        className={`absolute h-7 rounded-lg border text-white text-[11px] font-medium flex items-center px-2.5 shadow-md truncate transition-all hover:brightness-110 ${statusColor}`}
                        style={posStyles}
                      >
                        <span className="truncate">{task.title}</span>
                        {totalSubtasks > 0 && (
                          <span className="ml-2 font-mono text-[9px] opacity-80 shrink-0">
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
