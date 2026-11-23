import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { snappySpring } from '../../../utils/motion'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Flame,
} from 'lucide-react'

type PomodoroMode = 'work' | 'short_break' | 'long_break'

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60, // 25 minutes
  short_break: 5 * 60, // 5 minutes
  long_break: 15 * 60, // 15 minutes
}

export const PomodoroFocusTimer: React.FC = () => {
  const {
    routines,
    timerMode: mode,
    setTimerMode: handleModeChange,
    timerSecondsLeft: secondsLeft,
    isTimerRunning: isRunning,
    toggleTimer: toggleStartPause,
    resetTimer: handleReset,
    activeTimerRoutineId,
    setActiveTimerRoutineId,
  } = useTaskContext()

  // Derived effective routine id with fallback and validation
  const activeRoutineId = useMemo(() => {
    if (activeTimerRoutineId && routines.some((r) => r.id === activeTimerRoutineId)) {
      return activeTimerRoutineId
    }
    return routines.length > 0 ? routines[0].id : ''
  }, [activeTimerRoutineId, routines])

  // Format MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Circular progress calculation
  const totalDuration = MODE_DURATIONS[mode]
  const progressPercent = Math.round(((totalDuration - secondsLeft) / totalDuration) * 100)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  const activeLinkedRoutine = useMemo(() => {
    return routines.find((r) => r.id === activeRoutineId)
  }, [routines, activeRoutineId])

  return (
    <div
      data-testid="pomodoro-focus-timer-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Focus Time Tracker
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Pomodoro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-intensity deep work intervals & recovery
            </p>
          </div>
        </div>

        {/* Mode selector pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => handleModeChange('work')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              mode === 'work'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              mode === 'long_break'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            15m Break
          </button>
        </div>
      </div>

      {/* Routine Link Dropdown */}
      <div className="relative z-10 py-3 flex items-center justify-between gap-2 border-b border-white/[0.04]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" />
          Link Routine:
        </span>
        {routines.length > 0 ? (
          <select
            value={activeRoutineId}
            onChange={(e) => setActiveTimerRoutineId(e.target.value)}
            disabled={mode !== 'work'}
            className="flex-1 max-w-[240px] px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-white/10 text-purple-200 focus:outline-none focus:border-purple-400 truncate disabled:opacity-40"
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.title} ({r.targetDurationMinutes}m) {r.completedToday ? '✓' : ''}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-slate-500 italic">No routines configured</span>
        )}
      </div>

      {/* Timer Circular Dial & Monospace Display */}
      <div className="relative z-10 py-4 flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Circular SVG progress ring */}
          <svg className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="pomodoroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1C1B2E"
              strokeWidth="7"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#pomodoroGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </svg>

          {/* Central Digital Countdown Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              data-testid="pomodoro-timer-display"
              className="text-3xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
            >
              {formattedTime}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300 mt-1">
              {isRunning ? (mode === 'work' ? 'Deep Focus' : 'Recovery') : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls: Start/Pause + Reset */}
        <div className="flex items-center gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={snappySpring}
            onClick={toggleStartPause}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={snappySpring}
            onClick={handleReset}
            title="Reset timer"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
          {activeLinkedRoutine ? (
            <>
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  activeLinkedRoutine.completedToday ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{activeLinkedRoutine.title}</span>
            </>
          ) : (
            <span>No routine linked</span>
          )}
        </span>
        <span className="text-[10px] text-purple-300 font-mono">
          {progressPercent}% elapsed
        </span>
      </div>
    </div>
  )
}
