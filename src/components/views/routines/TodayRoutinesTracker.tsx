import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { snappySpring, checkboxPopVariants } from '../../../utils/motion'
import {
  CheckSquare,
  Flame,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Target,
} from 'lucide-react'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const TodayRoutinesTracker: React.FC = () => {
  const {
    routines,
    toggleRoutineToday,
    addRoutine,
    deleteRoutine,
    resetRoutinesToDefault,
  } = useTaskContext()

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState(30)
  const [newCategory, setNewCategory] = useState('General')

  // Completion metrics
  const totalRoutines = routines.length
  const completedCount = routines.filter((r) => r.completedToday).length
  const completionPercentage =
    totalRoutines > 0 ? Math.round((completedCount / totalRoutines) * 100) : 0

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault()
    const sanitizedTitle = newTitle.trim().slice(0, 80)
    if (!sanitizedTitle) return

    const sanitizedDuration = Math.min(
      240,
      Math.max(5, Math.abs(Number(newDuration)) || 25)
    )

    addRoutine({
      title: sanitizedTitle,
      targetDurationMinutes: sanitizedDuration,
      category: newCategory.trim().slice(0, 40) || 'General',
    })

    setNewTitle('')
    setNewDuration(30)
    setIsAdding(false)
  }

  return (
    <div
      data-testid="today-routines-tracker-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Today's Routines
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                7-Day Heatmap
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Daily habit execution & momentum streaks
            </p>
          </div>
        </div>

        {/* Action: Add Routine */}
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAdding ? 'Cancel' : 'Add Routine'}</span>
          </motion.button>
        </div>
      </div>

      {/* Daily Progress Bar */}
      <div className="relative z-10 py-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Daily Habit Goal</span>
          <span className="font-mono text-purple-300 font-bold">
            {completedCount} / {totalRoutines} completed ({completionPercentage}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${completionPercentage}%` }}
            transition={snappySpring}
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400"
          />
        </div>
      </div>

      {/* Inline Quick-Add Routine Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={snappySpring}
            noValidate
            onSubmit={handleCreateRoutine}
            className="relative z-10 mb-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 overflow-hidden"
          >
            <div className="text-xs font-bold text-purple-200">New Daily Routine</div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Routine title (e.g. Deep Code Review)"
                value={newTitle}
                maxLength={80}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="sm:col-span-6 px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              <input
                type="text"
                placeholder="Category"
                value={newCategory}
                maxLength={40}
                onChange={(e) => setNewCategory(e.target.value)}
                className="sm:col-span-3 px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              <div className="sm:col-span-3 flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 text-xs rounded-lg bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
                <span className="text-[10px] text-slate-400">min</span>
                <button
                  type="submit"
                  className="ml-auto px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Routines Checklist with 7-Day Mini Heatmap */}
      <div className="relative z-10 space-y-2 max-h-[290px] overflow-y-auto pr-1 flex-1">
        <AnimatePresence mode="popLayout">
          {routines.map((routine) => {
            const isDone = routine.completedToday

            return (
              <motion.div
                key={routine.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={snappySpring}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all select-none ${
                  isDone
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-slate-950/50 hover:bg-slate-900/60 border-white/[0.05]'
                }`}
              >
                {/* Left: Checkmark + Title + Target Duration + Streak */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Interactive spring checkmark button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    variants={checkboxPopVariants}
                    animate={isDone ? 'checked' : 'unchecked'}
                    onClick={() => toggleRoutineToday(routine.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-gradient-to-tr from-purple-600 to-emerald-500 text-white shadow-md shadow-purple-600/40 border border-purple-400/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-transparent border border-white/10 hover:border-purple-400/40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold tracking-tight truncate ${
                          isDone ? 'text-slate-300 line-through' : 'text-white'
                        }`}
                      >
                        {routine.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-purple-300">
                        <Clock className="w-2.5 h-2.5" />
                        {routine.targetDurationMinutes}m
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{routine.category || 'General'}</span>
                      <span>•</span>
                      {/* Streak counter with fire emoji */}
                      <span className="flex items-center gap-0.5 font-bold text-amber-400">
                        <span>🔥</span>
                        <span>{routine.streak}d streak</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: 7-Day Mini Heatmap Grid (Mon-Sun) */}
                <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      {routine.history.map((dayDone, dayIdx) => {
                        const isToday = dayIdx === 6 // 7th day is today
                        return (
                          <div
                            key={dayIdx}
                            title={`${DAY_LABELS[dayIdx]}: ${dayDone ? 'Completed' : 'Missed'}${
                              isToday ? ' (Today)' : ''
                            }`}
                            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                              dayDone
                                ? 'bg-gradient-to-br from-purple-500 to-emerald-400 text-white shadow-xs'
                                : 'bg-slate-900 border border-white/5 text-slate-400'
                            } ${isToday ? 'ring-1 ring-purple-400 shadow-sm shadow-purple-900/40' : ''}`}
                          >
                            {DAY_LABELS[dayIdx]}
                          </div>
                        )
                      })}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                      7-day history
                    </span>
                  </div>

                  {/* Delete button (visible on hover) */}
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    title="Delete routine"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {routines.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Target className="w-6 h-6 mb-2 text-slate-400" />
            <span>No active routines. Add one above or reset to defaults.</span>
            <button
              onClick={resetRoutinesToDefault}
              className="mt-2 text-purple-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset default habits
            </button>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Streak Multiplier</span>
        </span>
        <button
          onClick={resetRoutinesToDefault}
          title="Reset to showcase routines"
          className="hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Habits</span>
        </button>
      </div>
    </div>
  )
}
