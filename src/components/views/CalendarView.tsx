import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import { snappySpring } from '../../utils/motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Check,
} from 'lucide-react'

export const CalendarView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId, openCreateTaskModal } = useTaskContext()

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const [todayDateStr] = useState(() => new Date().toISOString().split('T')[0])

  // Calculate calendar days reliably using Date arithmetic
  const firstDayOfMonth = new Date(year, month, 1)
  const firstDayIndex = firstDayOfMonth.getDay() // 0 = Sun, 1 = Mon ...
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []

  // Preceding month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({ day: d.getDate(), isCurrentMonth: false, dateStr })
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ day: i, isCurrentMonth: true, dateStr })
  }

  // Trailing next month days to complete 35 or 42 grid cells
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month + 1, i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({ day: d.getDate(), isCurrentMonth: false, dateStr })
  }

  const getTasksForDate = (dateStr: string) => {
    return filteredTasks.filter((t) => t.dueDate === dateStr)
  }

  return (
    <div className="space-y-4 animate-fadeIn select-none">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-[11px] text-slate-400">Sprint planning and milestone schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-700" />
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-800 bg-[#0E1424] overflow-hidden shadow-xl">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0B0F1D] text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-[#0A0A0E]">
          {days.map(({ day, isCurrentMonth, dateStr }, index) => {
            const dayTasks = getTasksForDate(dateStr)
            const isToday = dateStr === todayDateStr

            return (
              <div
                key={index}
                className={`group min-h-[110px] p-2 flex flex-col transition-colors relative ${
                  isCurrentMonth ? 'bg-[#0E0E14]' : 'bg-[#0A0A0E]/40 opacity-40'
                } hover:bg-slate-800/40`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/50'
                        : isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="flex items-center gap-1">
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                    <button
                      onClick={() => openCreateTaskModal({ dueDate: dateStr })}
                      title={`Add task for ${dateStr}`}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-purple-300 hover:bg-purple-600/20 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tasks chips */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {dayTasks.map((task) => {
                    const isDone = task.status === 'done'
                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={snappySpring}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border text-slate-200 cursor-pointer truncate transition-colors flex items-center gap-1.5 shadow-sm ${
                          isDone
                            ? 'bg-slate-900/60 border-slate-800 line-through text-slate-400 opacity-70'
                            : 'bg-[#14141E] hover:bg-purple-600/25 border-white/[0.08] hover:border-purple-500/50'
                        }`}
                        title={`${task.taskCode}: ${task.title} (${task.status})`}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              task.priority === 'urgent'
                                ? 'bg-rose-400'
                                : task.priority === 'high'
                                ? 'bg-amber-400'
                                : task.priority === 'medium'
                                ? 'bg-purple-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                        )}
                        <span className="truncate">{task.title}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
