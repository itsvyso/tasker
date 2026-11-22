import React from 'react'
import { useTaskContext } from '../../context/TaskContext'
import type { Task } from '../../types'
import { Avatar } from '../common/Avatar'
import { Clock } from 'lucide-react'

export const TimelineView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId, users } = useTaskContext()

  // Timeline range: 2026-11-15 to 2026-12-05 (21 days)
  const startDate = new Date(2026, 10, 15) // Nov 15
  const totalDays = 21

  const timelineDays: { date: Date; dateStr: string; dayNum: number; dayName: string }[] = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
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

    const msPerDay = 1000 * 60 * 60 * 24
    const startOffsetDays = Math.max(0, Math.round((taskStart.getTime() - startDate.getTime()) / msPerDay))
    const durationDays = Math.max(1, Math.round((taskEnd.getTime() - taskStart.getTime()) / msPerDay) + 1)

    const leftPercent = Math.min(95, (startOffsetDays / totalDays) * 100)
    const widthPercent = Math.min(100 - leftPercent, Math.max(4, (durationDays / totalDays) * 100))

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Sprint Timeline & Gantt</h2>
            <p className="text-[11px] text-slate-400">
              Interactive task durations, milestones, and scheduling horizon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
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
      </div>

      {/* Gantt Chart Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1424] overflow-x-auto shadow-xl">
        <div className="min-w-[900px]">
          {/* Timeline Days Header */}
          <div className="flex border-b border-slate-800 bg-[#0B0F1C] text-xs">
            <div className="w-64 p-3 font-semibold text-slate-400 shrink-0 border-r border-slate-800">
              Tasks
            </div>
            <div className="flex-1 flex">
              {timelineDays.map(({ dayNum, dayName, dateStr }, i) => {
                const isToday = dateStr === '2026-11-22'
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center py-2 px-1 border-r border-slate-800/60 ${
                      isToday ? 'bg-indigo-950/40 text-indigo-300 font-bold' : 'text-slate-400'
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
                  ? 'bg-indigo-600/80 border-indigo-500 shadow-indigo-950/50'
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
                    <div
                      className={`absolute h-7 rounded-lg border text-white text-[11px] font-medium flex items-center px-2.5 shadow-md truncate transition-all hover:scale-[1.01] hover:brightness-110 ${statusColor}`}
                      style={posStyles}
                    >
                      <span className="truncate">{task.title}</span>
                      {totalSubtasks > 0 && (
                        <span className="ml-2 font-mono text-[9px] opacity-80 shrink-0">
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      )}
                    </div>
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
