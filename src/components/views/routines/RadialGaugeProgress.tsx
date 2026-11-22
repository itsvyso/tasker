import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../../context/TaskContext'
import { AnimatedCounter } from '../../common/AnimatedCounter'
import { snappySpring } from '../../../utils/motion'
import { Gauge, CheckCircle2, Clock, ListTodo, TrendingUp, Sparkles } from 'lucide-react'

export const RadialGaugeProgress: React.FC = () => {
  const { projectTasks, activeProject, setFilters, filters } = useTaskContext()

  // Calculate project metrics
  const { doneCount, inProgressCount, todoCount, totalTasks, percentage } = useMemo(() => {
    const total = projectTasks.length
    const done = projectTasks.filter((t) => t.status === 'done').length
    const inProgress = projectTasks.filter(
      (t) => t.status === 'in_progress' || t.status === 'in_review'
    ).length
    const todo = projectTasks.filter((t) => t.status === 'backlog').length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    return {
      doneCount: done,
      inProgressCount: inProgress,
      todoCount: todo,
      totalTasks: total,
      percentage: pct,
    }
  }, [projectTasks])

  // Semi-circle SVG arc parameters
  const radius = 75
  const arcLength = Math.PI * radius // ~235.62
  const strokeDashoffset = arcLength * (1 - Math.min(100, Math.max(0, percentage)) / 100)

  // Status message based on percentage
  const healthStatus = useMemo(() => {
    if (totalTasks === 0) return { label: 'Ready for Sprint', color: 'text-slate-400' }
    if (percentage >= 80) return { label: 'Optimal Sprint Pace', color: 'text-emerald-400' }
    if (percentage >= 50) return { label: 'On Track & Accelerating', color: 'text-purple-400' }
    return { label: 'Sprint In Progress', color: 'text-cyan-400' }
  }, [percentage, totalTasks])

  const metricTiles = [
    {
      id: 'done',
      label: 'Done',
      count: doneCount,
      percent: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      active: filters.status === 'done',
      onClick: () => setFilters({ status: filters.status === 'done' ? 'all' : 'done' }),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: inProgressCount,
      percent: totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0,
      icon: Clock,
      color: 'text-purple-400',
      dotColor: 'bg-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      active: filters.status === 'in_progress',
      onClick: () =>
        setFilters({ status: filters.status === 'in_progress' ? 'all' : 'in_progress' }),
    },
    {
      id: 'todo',
      label: 'To Do',
      count: todoCount,
      percent: totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0,
      icon: ListTodo,
      color: 'text-amber-400',
      dotColor: 'bg-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      active: filters.status === 'backlog',
      onClick: () => setFilters({ status: filters.status === 'backlog' ? 'all' : 'backlog' }),
    },
  ]

  return (
    <div
      data-testid="radial-gauge-progress-card"
      className="relative rounded-2xl bg-[#0E0E14] border border-white/[0.08] shadow-xl p-5 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-900/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Project Progress
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Radial Arc
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeProject.name} overall health
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-900/80 text-purple-300 border border-white/[0.08]">
          {totalTasks} total tasks
        </span>
      </div>

      {/* SVG Semi-Circle Radial Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-4 pb-1">
        <div className="relative w-56 h-32 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
            <defs>
              {/* Purple-to-Emerald linear gradient for the progress arc */}
              <linearGradient id="purpleToEmeraldGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              {/* Subtle shadow filter for neon depth */}
              <filter id="gaugeArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#A855F7" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background Track Arc (180 deg semi-circle) */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="#1C1B2E"
              strokeWidth="15"
              strokeLinecap="round"
            />

            {/* Subtle inner grid marks */}
            <path
              d="M 33 105 A 67 67 0 0 1 167 105"
              fill="none"
              stroke="#2A2845"
              strokeWidth="2"
              strokeDasharray="2 8"
            />

            {/* Foreground Value Arc */}
            <motion.path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="url(#purpleToEmeraldGauge)"
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              filter="url(#gaugeArcGlow)"
            />
          </svg>

          {/* Central Percentage & Label Overlay */}
          <div className="absolute bottom-4 flex flex-col items-center text-center">
            <div className="flex items-baseline justify-center">
              <AnimatedCounter
                value={percentage}
                suffix="%"
                className="text-3xl font-black text-white font-mono tracking-tight"
              />
            </div>
            <span className={`text-[11px] font-semibold tracking-tight ${healthStatus.color}`}>
              {healthStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Tiles: Done, In Progress, To Do */}
      <div className="relative z-10 pt-3 grid grid-cols-3 gap-2">
        {metricTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <motion.button
              key={tile.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={snappySpring}
              onClick={tile.onClick}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                tile.active
                  ? `${tile.bgColor} ring-2 ring-purple-500/40 shadow-md`
                  : 'bg-slate-950/60 hover:bg-slate-900/60 border-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${tile.color}`} />
                  {tile.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${tile.dotColor}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-extrabold text-white font-mono">
                  {tile.count}
                </span>
                <span className={`text-[10px] font-semibold font-mono ${tile.color}`}>
                  {tile.percent}%
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Card Footer */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Velocity Index: +14%</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Updated real-time
        </span>
      </div>
    </div>
  )
}
