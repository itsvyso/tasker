import React, { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap,
  ArrowUpRight,
} from 'lucide-react'

export const DynamicIsland: React.FC = () => {
  const {
    timerMode,
    setTimerMode,
    timerSecondsLeft,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    activeTimerRoutineId,
    setActiveTimerRoutineId,
    routines,
    syncStatus,
    setActiveView,
  } = useTaskContext()

  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const islandRef = useRef<HTMLDivElement>(null)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, 250)
  }

  // Click-outside, touch-outside and Escape key handling to gracefully collapse island
  useEffect(() => {
    if (!isExpanded) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded])

  // Format MM:SS
  const minutes = Math.floor(timerSecondsLeft / 60)
  const seconds = timerSecondsLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const modeLabel =
    timerMode === 'work' ? 'Deep Focus' : timerMode === 'short_break' ? 'Short Break' : 'Long Break'

  const activeRoutine = useMemo(() => {
    if (activeTimerRoutineId) {
      return routines.find((r) => r.id === activeTimerRoutineId) || routines[0]
    }
    return routines[0]
  }, [activeTimerRoutineId, routines])

  const totalDuration =
    timerMode === 'work' ? 25 * 60 : timerMode === 'short_break' ? 5 * 60 : 15 * 60
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalDuration - timerSecondsLeft) / totalDuration) * 100))
  )

  return (
    <div
      ref={islandRef}
      data-testid="dynamic-island"
      className="relative flex items-center justify-center z-40 select-none h-9 min-w-[180px] xs:min-w-[210px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 28, mass: 0.8 }}
        className={`absolute top-0 left-1/2 -translate-x-1/2 origin-top bg-[#09090D]/95 backdrop-blur-2xl border transition-colors shadow-2xl ${
          isExpanded
            ? 'w-[calc(100vw-1.5rem)] max-w-[370px] rounded-2xl border-white/[0.14] shadow-purple-950/60 p-3.5 flex flex-col gap-3 z-50'
            : 'h-9 px-3.5 rounded-full border-white/[0.10] hover:border-purple-500/40 shadow-black/80 flex items-center cursor-pointer whitespace-nowrap z-30'
        }`}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true)
          }
        }}
      >
        <AnimatePresence>
          {!isExpanded ? (
            /* Compact Ambient Pill */
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              data-testid="dynamic-island-compact"
              className="flex items-center gap-2.5 text-xs font-medium text-slate-200 whitespace-nowrap"
            >
              {isTimerRunning ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
                    <Timer className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                      {formattedTime}
                    </span>
                    <span className="text-slate-400 text-[10px] hidden xs:inline">• {modeLabel}</span>
                  </div>
                  {/* Mini animated equalizer bars */}
                  <div className="flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-0.5 h-2 bg-purple-400/80 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-violet-400/80 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-fuchsia-400/80 rounded-full animate-pulse [animation-delay:300ms]" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
                    <span className="text-xs font-semibold text-slate-100">
                      {syncStatus === 'synced' ? 'Supabase Sync' : 'Taske Ambient'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
                      {formattedTime}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
                </>
              )}
            </motion.div>
          ) : (
            /* Expanded Interactive Island Widget */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="dynamic-island-expanded"
              className="flex flex-col gap-3 w-full"
            >
              {/* Island Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  <span className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">
                    ⚡ Supabase Synced
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {modeLabel}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(false)
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Minimize"
                    aria-label="Minimize"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/[0.06]">
                <button
                  data-testid="island-mode-work"
                  onClick={() => setTimerMode('work')}
                  className={`py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                    timerMode === 'work'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  data-testid="island-mode-break"
                  onClick={() => setTimerMode('short_break')}
                  className={`py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                    timerMode === 'short_break'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  5m Break
                </button>
                <button
                  data-testid="island-mode-long"
                  onClick={() => setTimerMode('long_break')}
                  className={`py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                    timerMode === 'long_break'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  15m Long
                </button>
              </div>

              {/* Countdown & Quick Action Row */}
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <span className="text-3xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                    {formattedTime}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {progressPercent}% completed ({modeLabel})
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    data-testid="island-play-pause-btn"
                    onClick={toggleTimer}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start</span>
                      </>
                    )}
                  </button>

                  <button
                    data-testid="island-reset-btn"
                    onClick={resetTimer}
                    title="Reset countdown"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Linked Routine / Bento View Shortcut */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2 text-slate-300">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeRoutine?.completedToday ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  {routines.length > 0 ? (
                    <select
                      value={activeRoutine?.id || ''}
                      onChange={(e) => setActiveTimerRoutineId(e.target.value)}
                      className="bg-transparent text-purple-200 text-[11px] font-medium focus:outline-none truncate cursor-pointer hover:text-purple-100"
                    >
                      {routines.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#09090D] text-white">
                          {r.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="truncate">Deep Work Session</span>
                  )}
                </div>

                <button
                  data-testid="island-routines-btn"
                  onClick={() => {
                    setActiveView('routines')
                    setIsExpanded(false)
                  }}
                  className="flex items-center gap-1 text-[10px] text-purple-300 hover:text-white transition-colors shrink-0 font-medium cursor-pointer"
                >
                  <span>Bento Hub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
export default DynamicIsland
