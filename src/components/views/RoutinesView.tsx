import React from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import { DotMatrixSchedule } from './routines/DotMatrixSchedule'
import { TaskStatusCapsules } from './routines/TaskStatusCapsules'
import { RadialGaugeProgress } from './routines/RadialGaugeProgress'
import { TodayRoutinesTracker } from './routines/TodayRoutinesTracker'
import { TeamWaveformInsights } from './routines/TeamWaveformInsights'
import { PomodoroFocusTimer } from './routines/PomodoroFocusTimer'
import { createStaggerContainer, staggerItem } from '../../utils/motion'
import {
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
} from 'lucide-react'

const containerVariants = createStaggerContainer(0.04, 0.02)

export const RoutinesView: React.FC = () => {
  const { activeProject, routines } = useTaskContext()

  // Calculate high-level header KPI stats
  const totalRoutines = routines.length
  const completedRoutines = routines.filter((r) => r.completedToday).length
  const completionPercentage =
    totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0

  const maxStreak = routines.reduce((max, r) => Math.max(max, r.streak), 0)
  const totalTargetMinutes = routines.reduce((sum, r) => sum + r.targetDurationMinutes, 0)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12 select-none"
    >
      {/* Top Hero Banner */}
      <motion.div
        variants={staggerItem}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#100E1D] to-indigo-950/40 border border-purple-500/20 p-6 shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Routines & Insights • Sprint Rhythm
              </span>
              <span className="text-xs text-slate-400">
                Project: {activeProject.name} ({activeProject.code})
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Habits, 3D Telemetry & Deep Work
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Track daily engineering rituals, schedule time blocks across the dot matrix grid,
              monitor 3D priority completion, and execute Pomodoro focus sessions.
            </p>
          </div>

          {/* Quick Header Metric Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Routines Done
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {completedRoutines}/{totalRoutines} ({completionPercentage}%)
                </span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Peak Streak
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  🔥 {maxStreak} days
                </span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Target Focus
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {totalTargetMinutes} min/day
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Bento Row: Projects Timeline (Dot Matrix) + Task Status (3D Capsules) */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
      >
        {/* Top-Left: Projects Timeline & Routine Schedule (Dot Matrix Grid) */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col">
          <DotMatrixSchedule />
        </div>

        {/* Top-Right: Task Status (3D Progress Capsules) */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <TaskStatusCapsules />
        </div>
      </motion.div>

      {/* Bottom Bento Row: Radial Gauge + Routines Tracker + Pomodoro & Team Waveform */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Bottom-Left: Project Progress Radial Gauge */}
        <div className="md:col-span-1 lg:col-span-4 flex flex-col">
          <RadialGaugeProgress />
        </div>

        {/* Bottom-Center: Today's Routines Tracker with 7-Day Heatmap */}
        <div className="md:col-span-1 lg:col-span-4 flex flex-col">
          <TodayRoutinesTracker />
        </div>

        {/* Bottom-Right: Pomodoro Focus Timer & Team Insights Waveform */}
        <div className="md:col-span-2 lg:col-span-4 flex flex-col gap-6">
          <PomodoroFocusTimer />
          <TeamWaveformInsights />
        </div>
      </motion.div>
    </motion.div>
  )
}
export default RoutinesView
